import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { first, query, transaction } from '../db/mysql.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { eventScopeCondition, requireEventScope } from '../auth/scope.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import { countActiveReservations, releaseExpiredReservations } from '../utils/capacityReservations.js';
import { paymentApprovalState } from '../utils/eventRegistrationPolicy.js';

const router = express.Router();
const requireRegistrationAdmin = [requireAuth, requirePermission('registrations.manage')];

const registrationSchema = z.object({
  eventId: z.number().int().positive(),
  ticketTypeId: z.number().int().positive(),
  source: z.enum(['online', 'manual', 'kiosk']).default('online'),
  fullName: z.string().min(2),
  mobile: z.string().min(7),
  email: z.string().email(),
  address: z.string().optional().nullable(),
  countryCode: z.string().min(2).max(2).transform((value) => value.toUpperCase()),
  countryName: z.string().min(2),
  city: z.string().min(2),
  specialty: z.string().min(2),
  nationality: z.string().min(2),
  preferredLanguage: z.enum(['ar', 'en']).default('en'),
  paymentReference: z.string().optional().nullable(),
  paymentProofUrl: z.string().optional().nullable(),
});

const paymentReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewedByUserId: z.number().int().positive().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

const proofSchema = z.object({
  paymentReference: z.string().optional().nullable(),
  paymentProofUrl: z.string().min(2),
});

const orderStatusSchema = z.object({
  status: z.enum(['paid', 'cancelled', 'refunded']),
  reviewedByUserId: z.number().int().positive().optional().nullable(),
});

function normalizeRegistrationInput(input) {
  return {
    ...input,
    address: input.address || null,
    paymentReference: input.paymentReference || null,
    paymentProofUrl: input.paymentProofUrl || null,
  };
}

function isEgyptianCountry(countryCode = '', countryName = '', nationality = '') {
  const code = countryCode.trim().toUpperCase();
  const normalized = `${countryName} ${nationality}`.trim().toLowerCase();
  return code === 'EG' || normalized.includes('egypt') || normalized.includes('egyptian') || normalized.includes('مصر') || normalized.includes('مصري');
}

function registrationNumber() {
  return `REG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function orderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function attendeeNumber() {
  return `ATT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function ticketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function qrToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function currentPricePeriod(ticketTypeId, currency) {
  const row = await first(`
    SELECT
      id,
      label_en,
      label_ar,
      price,
      price_egp,
      price_usd,
      currency,
      starts_at,
      ends_at
    FROM ticket_price_periods
    WHERE ticket_type_id = :ticketTypeId
      AND is_active = 1
      AND starts_at <= NOW()
      AND ends_at >= NOW()
    ORDER BY starts_at DESC
    LIMIT 1
  `, { ticketTypeId });

  if (!row) return null;

  const selectedPrice = currency === 'EGP'
    ? Number(row.price_egp ?? row.price)
    : Number(row.price_usd ?? row.price);

  return {
    ...row,
    selected_price: selectedPrice,
    selected_currency: currency,
  };
}

async function activeBankAccount(currency) {
  return first(`
    SELECT id, account_name, bank_name, account_number, iban, swift_code, currency
    FROM bank_accounts
    WHERE currency = :currency AND is_active = 1
    ORDER BY id ASC
    LIMIT 1
  `, { currency });
}

router.get('/', ...requireRegistrationAdmin, asyncRoute(async (req, res) => {
  const status = String(req.query.status || '').trim();
  const eventId = Number(req.query.eventId || 0);
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit || 300)));
  const offset = Math.max(0, Number(req.query.offset || 0));

  if (eventId && !(await requireEventScope(req, res, eventId))) return;
  const scope = eventScopeCondition(req.user, 'e');
  const rows = await query(`
    SELECT
      r.id,
      r.registration_number,
      r.event_id,
      r.ticket_type_id,
      r.doctor_id,
      r.order_id,
      r.source,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      r.payment_reference,
      r.payment_proof_url,
      r.created_at,
      o.order_number,
      o.status AS order_status,
      o.grand_total,
      o.currency AS order_currency,
      d.full_name AS doctor_name,
      d.mobile AS doctor_mobile,
      d.email AS doctor_email,
      d.country_code,
      d.country_name,
      d.specialty,
      d.nationality,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      gt.ticket_number,
      gt.pdf_url AS ticket_pdf_url
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN orders o ON o.id = r.order_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    WHERE (:status = '' OR r.registration_status = :status OR r.payment_status = :status)
      AND (:eventId = 0 OR r.event_id = :eventId)
      AND (${scope.clause})
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT :limit OFFSET :offset
  `, { status, eventId, limit, offset, ...scope.params });

  // If meta is requested, also return total count for pagination
  if (String(req.query.meta || '') === 'true') {
    const countRow = await first(`
      SELECT COUNT(*) AS total
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE (:status = '' OR r.registration_status = :status OR r.payment_status = :status)
        AND (:eventId = 0 OR r.event_id = :eventId)
        AND (${scope.clause})
    `, { status, eventId, ...scope.params });
    ok(res, { data: rows, pagination: { total: Number(countRow.total || 0), limit, offset } });
    return;
  }

  ok(res, rows);
}));

router.get('/:id', ...requireRegistrationAdmin, asyncRoute(async (req, res) => {
  const registration = await first(`
    SELECT
      r.*,
      o.order_number,
      o.status AS order_status,
      o.grand_total,
      o.currency AS order_currency,
      d.full_name AS doctor_name,
      d.mobile AS doctor_mobile,
      d.email AS doctor_email,
      d.address AS doctor_address,
      d.country_code,
      d.country_name,
      d.city,
      d.specialty,
      d.nationality,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      gt.ticket_number,
      gt.qr_token,
      gt.pdf_url AS ticket_pdf_url
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN orders o ON o.id = r.order_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    WHERE r.id = :id
  `, { id: Number(req.params.id) });

  if (!registration) return fail(res, 404, 'Registration not found');
  if (!(await requireEventScope(req, res, registration.event_id))) return;
  ok(res, registration);
}));

router.post('/', asyncRoute(async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const input = normalizeRegistrationInput(parsed.data);
  const currency = isEgyptianCountry(input.countryCode, input.countryName, input.nationality) ? 'EGP' : 'USD';
  const pricePeriod = await currentPricePeriod(input.ticketTypeId, currency);
  if (!pricePeriod) return fail(res, 422, 'No active price period for this ticket type');

  const event = await first('SELECT id, title_en FROM events WHERE id = :eventId', { eventId: input.eventId });
  if (!event) return fail(res, 404, 'Event not found');

  const ticketType = await first(`
    SELECT id, event_id, name_en, quota
    FROM ticket_types
    WHERE id = :ticketTypeId AND event_id = :eventId AND is_active = 1
  `, { ticketTypeId: input.ticketTypeId, eventId: input.eventId });
  if (!ticketType) return fail(res, 404, 'Ticket type not found for this event');

  const registration = await transaction(async (connection) => {
    const [existingDoctors] = await connection.execute(
      'SELECT id FROM doctors WHERE email = :email LIMIT 1',
      { email: input.email }
    );

    let doctorId = existingDoctors[0]?.id;
    if (doctorId) {
      await connection.execute(`
        UPDATE doctors
        SET
          full_name = :fullName,
          mobile = :mobile,
          address = :address,
          country_code = :countryCode,
          country_name = :countryName,
          city = :city,
          specialty = :specialty,
          nationality = :nationality,
          preferred_language = :preferredLanguage
        WHERE id = :doctorId
      `, { ...input, doctorId });
    } else {
      const [doctorResult] = await connection.execute(`
        INSERT INTO doctors (
          full_name,
          mobile,
          email,
          address,
          country_code,
          country_name,
          city,
          specialty,
          nationality,
          preferred_language
        )
        VALUES (
          :fullName,
          :mobile,
          :email,
          :address,
          :countryCode,
          :countryName,
          :city,
          :specialty,
          :nationality,
          :preferredLanguage
        )
      `, input);
      doctorId = doctorResult.insertId;
    }

    const [orderResult] = await connection.execute(`
      INSERT INTO orders (
        event_id,
        order_number,
        status,
        subtotal,
        grand_total,
        currency,
        customer_name,
        customer_email,
        customer_phone
      )
      VALUES (
        :eventId,
        :orderNumber,
        'pending_payment',
        :selectedPrice,
        :selectedPrice,
        :selectedCurrency,
        :fullName,
        :email,
        :mobile
      )
    `, {
      eventId: input.eventId,
      orderNumber: orderNumber(),
      selectedPrice: pricePeriod.selected_price,
      selectedCurrency: pricePeriod.selected_currency,
      fullName: input.fullName,
      email: input.email,
      mobile: input.mobile,
    });

    const status = input.paymentProofUrl ? 'pending_verification' : 'pending_payment';
    const nextRegistrationNumber = registrationNumber();
    const [registrationResult] = await connection.execute(`
      INSERT INTO registrations (
        registration_number,
        doctor_id,
        event_id,
        ticket_type_id,
        order_id,
        source,
        registration_status,
        payment_status,
        selected_currency,
        selected_price,
        selected_price_period_id,
        payment_reference,
        payment_proof_url
      )
      VALUES (
        :registrationNumber,
        :doctorId,
        :eventId,
        :ticketTypeId,
        :orderId,
        :source,
        :registrationStatus,
        'pending',
        :selectedCurrency,
        :selectedPrice,
        :pricePeriodId,
        :paymentReference,
        :paymentProofUrl
      )
    `, {
      registrationNumber: nextRegistrationNumber,
      doctorId,
      eventId: input.eventId,
      ticketTypeId: input.ticketTypeId,
      orderId: orderResult.insertId,
      source: input.source,
      registrationStatus: status,
      selectedCurrency: pricePeriod.selected_currency,
      selectedPrice: pricePeriod.selected_price,
      pricePeriodId: pricePeriod.id,
      paymentReference: input.paymentReference,
      paymentProofUrl: input.paymentProofUrl,
    });

    return {
      id: registrationResult.insertId,
      registrationNumber: nextRegistrationNumber,
      doctorId,
      orderId: orderResult.insertId,
      currency: pricePeriod.selected_currency,
      price: pricePeriod.selected_price,
      status,
    };
  });

  const bankAccount = await activeBankAccount(currency);
  ok(res, { ...registration, bankAccount }, 'Registration created. Payment is pending verification.');
}));

router.patch('/:id/payment-proof', asyncRoute(async (req, res) => {
  const parsed = proofSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const registration = await first(`
    SELECT id, registration_status, capacity_reservation_status
    FROM registrations
    WHERE id = :id
    LIMIT 1
  `, { id: Number(req.params.id) });
  if (!registration) return fail(res, 404, 'Registration not found');
  if (registration.registration_status === 'expired' || registration.capacity_reservation_status === 'expired') {
    return fail(res, 409, 'Reservation has expired. Please start a new checkout or contact support.');
  }

  await query(`
    UPDATE registrations
    SET
      payment_reference = :paymentReference,
      payment_proof_url = :paymentProofUrl,
      registration_status = 'pending_verification',
      payment_status = 'pending',
      reservation_expires_at = NULL,
      capacity_reservation_status = 'active',
      capacity_released_at = NULL,
      capacity_release_reason = NULL
    WHERE id = :id
  `, {
    id: Number(req.params.id),
    paymentReference: parsed.data.paymentReference || null,
    paymentProofUrl: parsed.data.paymentProofUrl,
  });

  ok(res, { id: Number(req.params.id) }, 'Payment proof submitted');
}));

router.patch('/:id/payment-review', requireAuth, requirePermission('payments.verify'), asyncRoute(async (req, res) => {
  const parsed = paymentReviewSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const registration = await first(`
    SELECT
      r.id,
      r.order_id,
      r.event_id,
      r.ticket_type_id,
      r.registration_status,
      r.payment_status,
      r.capacity_reservation_status,
      r.reservation_expires_at,
      d.full_name,
      d.email,
      d.mobile,
      d.specialty
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    WHERE r.id = :id
  `, { id: Number(req.params.id) });

  if (!registration) return fail(res, 404, 'Registration not found');
  if (!(await requireEventScope(req, res, registration.event_id))) return;

  const review = parsed.data;
  const reviewedByUserId = review.reviewedByUserId || null;
  const rejectionReason = review.rejectionReason || null;

  if (review.status === 'rejected') {
    await query(`
      UPDATE registrations
      SET
        registration_status = 'rejected',
        payment_status = 'rejected',
        payment_reviewed_by_user_id = :reviewedByUserId,
        payment_reviewed_at = NOW(),
        payment_rejection_reason = :rejectionReason,
        capacity_reservation_status = 'released',
        capacity_released_at = COALESCE(capacity_released_at, NOW()),
        capacity_release_reason = COALESCE(capacity_release_reason, 'payment_rejected')
      WHERE id = :id
    `, { id: registration.id, reviewedByUserId, rejectionReason });

    await query("UPDATE orders SET status = 'pending_payment' WHERE id = :orderId", { orderId: registration.order_id });
    return ok(res, { id: registration.id, status: 'rejected' }, 'Payment rejected');
  }

  const approved = await transaction(async (connection) => {
    const [[eventRow], [ticketRow]] = await Promise.all([
      connection.execute('SELECT id, max_attendees, registration_approval_mode FROM events WHERE id = :eventId LIMIT 1 FOR UPDATE', { eventId: registration.event_id }),
      connection.execute('SELECT id, quota FROM ticket_types WHERE id = :ticketTypeId LIMIT 1 FOR UPDATE', { ticketTypeId: registration.ticket_type_id }),
    ]);
    await releaseExpiredReservations(connection, { eventId: registration.event_id, ticketTypeId: registration.ticket_type_id });

    const [freshRows] = await connection.execute(`
      SELECT id, capacity_reservation_status, registration_status
      FROM registrations
      WHERE id = :id
      LIMIT 1 FOR UPDATE
    `, { id: registration.id });
    const fresh = freshRows[0];
    if (!fresh) throw new Error('Registration not found');
    if (fresh.capacity_reservation_status === 'expired' || fresh.registration_status === 'expired') {
      const { ticketReservedCount, eventReservedCount } = await countActiveReservations(connection, registration.event_id, registration.ticket_type_id);
      const eventCapacityFull = Boolean(eventRow[0]?.max_attendees && eventReservedCount + 1 > Number(eventRow[0].max_attendees));
      const ticketCapacityFull = Boolean(ticketRow[0]?.quota && ticketReservedCount + 1 > Number(ticketRow[0].quota));
      if (eventCapacityFull || ticketCapacityFull) {
        const error = new Error('Capacity is no longer available for this expired reservation');
        error.statusCode = 409;
        throw error;
      }
    }

    const approvalState = paymentApprovalState({ approvalMode: eventRow[0]?.registration_approval_mode || 'automatic' });

    await connection.execute(`
      UPDATE registrations
      SET
        registration_status = :registrationStatus,
        payment_status = :paymentStatus,
        capacity_reservation_status = 'active',
        capacity_released_at = NULL,
        capacity_release_reason = NULL,
        reservation_expires_at = NULL,
        payment_reviewed_by_user_id = :reviewedByUserId,
        payment_reviewed_at = NOW(),
        payment_rejection_reason = NULL
      WHERE id = :id
    `, {
      id: registration.id,
      reviewedByUserId,
      registrationStatus: approvalState.registrationStatus,
      paymentStatus: approvalState.paymentStatus,
    });

    await connection.execute("UPDATE orders SET status = :status WHERE id = :orderId", {
      orderId: registration.order_id,
      status: approvalState.orderStatus,
    });

    if (!approvalState.shouldIssueTicket) {
      return {
        pendingReview: true,
        registrationStatus: approvalState.registrationStatus,
        paymentStatus: approvalState.paymentStatus,
      };
    }

    const [existingAttendees] = await connection.execute(
      'SELECT id, qr_token FROM attendees WHERE order_id = :orderId AND event_id = :eventId AND ticket_type_id = :ticketTypeId LIMIT 1',
      {
        orderId: registration.order_id,
        eventId: registration.event_id,
        ticketTypeId: registration.ticket_type_id,
      }
    );

    let attendeeId = existingAttendees[0]?.id;
    let token = existingAttendees[0]?.qr_token || qrToken();

    if (!attendeeId) {
      const [attendeeResult] = await connection.execute(`
        INSERT INTO attendees (
          order_id,
          event_id,
          ticket_type_id,
          attendee_number,
          full_name,
          email,
          phone,
          job_title,
          organization,
          qr_token
        )
        VALUES (
          :orderId,
          :eventId,
          :ticketTypeId,
          :attendeeNumber,
          :fullName,
          :email,
          :mobile,
          :specialty,
          NULL,
          :qrToken
        )
      `, {
        orderId: registration.order_id,
        eventId: registration.event_id,
        ticketTypeId: registration.ticket_type_id,
        attendeeNumber: attendeeNumber(),
        fullName: registration.full_name,
        email: registration.email,
        mobile: registration.mobile,
        specialty: registration.specialty,
        qrToken: token,
      });
      attendeeId = attendeeResult.insertId;
    }

    const [existingTickets] = await connection.execute(
      'SELECT id, ticket_number FROM generated_tickets WHERE registration_id = :registrationId LIMIT 1',
      { registrationId: registration.id }
    );

    if (existingTickets[0]) {
      return {
        attendeeId,
        ticketId: existingTickets[0].id,
        ticketNumber: existingTickets[0].ticket_number,
        qrToken: token,
      };
    }

    const nextTicketNumber = ticketNumber();
    const [ticketResult] = await connection.execute(`
      INSERT INTO generated_tickets (
        registration_id,
        attendee_id,
        ticket_number,
        qr_token,
        generated_at
      )
      VALUES (
        :registrationId,
        :attendeeId,
        :ticketNumber,
        :qrToken,
        NOW()
      )
    `, {
      registrationId: registration.id,
      attendeeId,
      ticketNumber: nextTicketNumber,
      qrToken: token,
    });

    return {
      attendeeId,
      ticketId: ticketResult.insertId,
      ticketNumber: nextTicketNumber,
      qrToken: token,
    };
  });

  ok(
    res,
    { id: registration.id, status: approved.pendingReview ? 'pending_review' : 'approved', ...approved },
    approved.pendingReview ? 'Payment approved. Registration is pending manual review.' : 'Payment approved and ticket generated'
  );
}));

router.patch('/:id/review', ...requireRegistrationAdmin, asyncRoute(async (req, res) => {
  const parsed = z.object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().optional().nullable(),
  }).safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const registration = await first(`
    SELECT r.id, r.order_id, r.event_id, r.ticket_type_id, r.registration_status, r.payment_status,
           d.full_name, d.email, d.mobile, d.specialty
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    WHERE r.id = :id
  `, { id: Number(req.params.id) });

  if (!registration) return fail(res, 404, 'Registration not found');
  if (!(await requireEventScope(req, res, registration.event_id))) return;

  if (parsed.data.status === 'rejected') {
    await query(`
      UPDATE registrations
      SET registration_status = 'rejected',
          capacity_reservation_status = 'released',
          capacity_released_at = COALESCE(capacity_released_at, NOW()),
          capacity_release_reason = COALESCE(capacity_release_reason, 'registration_rejected'),
          payment_rejection_reason = :rejectionReason,
          updated_at = NOW()
      WHERE id = :id
    `, { id: registration.id, rejectionReason: parsed.data.rejectionReason || null });
    return ok(res, { id: registration.id, status: 'rejected' }, 'Registration rejected');
  }

  if (registration.payment_status !== 'approved') {
    return fail(res, 409, 'Payment must be approved before registration approval can issue a ticket');
  }

  const approved = await transaction(async (connection) => {
    const [existingAttendees] = await connection.execute(
      'SELECT id, qr_token FROM attendees WHERE order_id = :orderId AND event_id = :eventId AND ticket_type_id = :ticketTypeId LIMIT 1',
      {
        orderId: registration.order_id,
        eventId: registration.event_id,
        ticketTypeId: registration.ticket_type_id,
      }
    );

    let attendeeId = existingAttendees[0]?.id;
    let token = existingAttendees[0]?.qr_token || qrToken();

    if (!attendeeId) {
      const [attendeeResult] = await connection.execute(`
        INSERT INTO attendees (
          order_id, event_id, ticket_type_id, attendee_number, full_name, email, phone, job_title, organization, qr_token
        )
        VALUES (
          :orderId, :eventId, :ticketTypeId, :attendeeNumber, :fullName, :email, :mobile, :specialty, NULL, :qrToken
        )
      `, {
        orderId: registration.order_id,
        eventId: registration.event_id,
        ticketTypeId: registration.ticket_type_id,
        attendeeNumber: attendeeNumber(),
        fullName: registration.full_name,
        email: registration.email,
        mobile: registration.mobile,
        specialty: registration.specialty,
        qrToken: token,
      });
      attendeeId = attendeeResult.insertId;
    }

    const [existingTickets] = await connection.execute(
      'SELECT id, ticket_number FROM generated_tickets WHERE registration_id = :registrationId LIMIT 1',
      { registrationId: registration.id }
    );

    let ticketId = existingTickets[0]?.id;
    let generatedTicketNumber = existingTickets[0]?.ticket_number;
    if (!ticketId) {
      generatedTicketNumber = ticketNumber();
      const [ticketResult] = await connection.execute(`
        INSERT INTO generated_tickets (registration_id, attendee_id, ticket_number, qr_token, generated_at)
        VALUES (:registrationId, :attendeeId, :ticketNumber, :qrToken, NOW())
      `, {
        registrationId: registration.id,
        attendeeId,
        ticketNumber: generatedTicketNumber,
        qrToken: token,
      });
      ticketId = ticketResult.insertId;
    }

    await connection.execute(`
      UPDATE registrations
      SET registration_status = 'approved',
          capacity_reservation_status = 'active',
          capacity_released_at = NULL,
          capacity_release_reason = NULL,
          updated_at = NOW()
      WHERE id = :id
    `, { id: registration.id });

    return { attendeeId, ticketId, ticketNumber: generatedTicketNumber };
  });

  ok(res, { id: registration.id, status: 'approved', ...approved }, 'Registration approved and ticket generated');
}));

router.patch('/:id/order-status', ...requireRegistrationAdmin, asyncRoute(async (req, res) => {
  const parsed = orderStatusSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const registration = await first(`
    SELECT r.id, r.order_id, r.event_id, r.ticket_type_id, d.full_name, d.email, d.mobile, d.specialty
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    WHERE r.id = :id
  `, { id: Number(req.params.id) });

  if (!registration) return fail(res, 404, 'Registration not found');

  const registrationStatus = parsed.data.status === 'cancelled' ? 'cancelled' : 'approved';
  const paymentStatus = parsed.data.status === 'paid' || parsed.data.status === 'refunded' ? 'approved' : 'pending';

  const updated = await transaction(async (connection) => {
    await connection.execute(`
      UPDATE registrations
      SET registration_status = :registrationStatus, payment_status = :paymentStatus, updated_at = NOW()
      WHERE id = :id
    `, {
      id: registration.id,
      registrationStatus,
      paymentStatus,
    });

    await connection.execute('UPDATE orders SET status = :status WHERE id = :orderId', {
      orderId: registration.order_id,
      status: parsed.data.status,
    });

    if (parsed.data.status === 'cancelled') {
      await connection.execute("UPDATE attendees SET qr_status = 'revoked' WHERE order_id = :orderId", {
        orderId: registration.order_id,
      });
      return null;
    }

    if (parsed.data.status !== 'paid') {
      return null;
    }

    const [existingAttendees] = await connection.execute(
      'SELECT id, qr_token FROM attendees WHERE order_id = :orderId AND event_id = :eventId AND ticket_type_id = :ticketTypeId LIMIT 1',
      {
        orderId: registration.order_id,
        eventId: registration.event_id,
        ticketTypeId: registration.ticket_type_id,
      }
    );

    let attendeeId = existingAttendees[0]?.id;
    let token = existingAttendees[0]?.qr_token || qrToken();

    if (!attendeeId) {
      const [attendeeResult] = await connection.execute(`
        INSERT INTO attendees (
          order_id,
          event_id,
          ticket_type_id,
          attendee_number,
          full_name,
          email,
          phone,
          job_title,
          organization,
          qr_token
        )
        VALUES (
          :orderId,
          :eventId,
          :ticketTypeId,
          :attendeeNumber,
          :fullName,
          :email,
          :mobile,
          :specialty,
          NULL,
          :qrToken
        )
      `, {
        orderId: registration.order_id,
        eventId: registration.event_id,
        ticketTypeId: registration.ticket_type_id,
        attendeeNumber: attendeeNumber(),
        fullName: registration.full_name,
        email: registration.email,
        mobile: registration.mobile,
        specialty: registration.specialty,
        qrToken: token,
      });
      attendeeId = attendeeResult.insertId;
    }

    const [existingTickets] = await connection.execute(
      'SELECT id, ticket_number FROM generated_tickets WHERE registration_id = :registrationId LIMIT 1',
      { registrationId: registration.id }
    );

    if (existingTickets[0]) {
      return {
        attendeeId,
        ticketId: existingTickets[0].id,
        ticketNumber: existingTickets[0].ticket_number,
        qrToken: token,
      };
    }

    const nextTicketNumber = ticketNumber();
    const [ticketResult] = await connection.execute(`
      INSERT INTO generated_tickets (
        registration_id,
        attendee_id,
        ticket_number,
        qr_token,
        generated_at
      )
      VALUES (
        :registrationId,
        :attendeeId,
        :ticketNumber,
        :qrToken,
        NOW()
      )
    `, {
      registrationId: registration.id,
      attendeeId,
      ticketNumber: nextTicketNumber,
      qrToken: token,
    });

    return {
      attendeeId,
      ticketId: ticketResult.insertId,
      ticketNumber: nextTicketNumber,
      qrToken: token,
    };
  });

  ok(res, { id: registration.id, status: parsed.data.status, generated: updated }, 'Order status updated');
}));

export default router;
