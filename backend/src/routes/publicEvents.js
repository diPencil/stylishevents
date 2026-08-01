import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { first, query, transaction } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import {
  countActiveReservations,
  releaseExpiredReservations,
  reservationExpirySql,
} from '../utils/capacityReservations.js';
import { checkoutInitialState, normalizeEventPolicy } from '../utils/eventRegistrationPolicy.js';

const router = express.Router();

const checkoutSchema = z.object({
  idempotencyKey: z.string().min(12).max(120),
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().positive().max(20).default(1),
  fullName: z.string().min(2).max(180),
  mobile: z.string().min(7).max(40),
  email: z.string().email().max(180),
  address: z.string().max(500).optional().nullable(),
  countryCode: z.string().min(2).max(2).transform((value) => value.toUpperCase()),
  countryName: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  specialty: z.string().min(2).max(180),
  nationality: z.string().min(2).max(120),
  preferredLanguage: z.enum(['ar', 'en']).default('en'),
  paymentReference: z.string().max(180).optional().nullable(),
  paymentProofUrl: z.string().max(500).optional().nullable(),
});

function isEgyptianCountry(countryCode = '', countryName = '', nationality = '') {
  const normalized = `${countryName} ${nationality}`.trim().toLowerCase();
  return countryCode.trim().toUpperCase() === 'EG'
    || normalized.includes('egypt')
    || normalized.includes('egyptian')
    || normalized.includes('مصر')
    || normalized.includes('مصري');
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

function payloadHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function confirmationToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rawValue.join('=') || '');
  }
  return '';
}

function confirmationCookieName(reference) {
  return `se_conf_${String(reference).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

function eventState(event, soldOut = false) {
  const now = Date.now();
  const startsAt = event.starts_at ? new Date(event.starts_at).getTime() : 0;
  const endsAt = event.ends_at ? new Date(event.ends_at).getTime() : 0;
  const opensAt = event.registration_starts_at ? new Date(event.registration_starts_at).getTime() : 0;
  const closesAt = event.registration_ends_at ? new Date(event.registration_ends_at).getTime() : 0;

  if (Number(event.public_registration_enabled ?? 1) !== 1) return 'disabled';
  if (event.status === 'cancelled' || event.status === 'disabled') return 'cancelled';
  if (event.status === 'sold_out' || soldOut) return 'sold_out';
  if (endsAt && endsAt < now) return 'ended';
  if (opensAt && opensAt > now) return 'opens_soon';
  if (closesAt && closesAt < now) return 'closed';
  if (startsAt && startsAt < now) return 'closed';
  return 'open';
}

function publicEventSelect() {
  return `
    SELECT
      e.id,
      e.slug,
      e.title_en,
      e.title_ar,
      e.summary_en,
      e.summary_ar,
      e.description_en,
      e.description_ar,
      e.type,
      e.status,
      e.starts_at,
      e.ends_at,
      e.registration_starts_at,
      e.registration_ends_at,
      e.public_registration_enabled,
      e.registration_approval_mode,
      e.registration_access,
      e.max_tickets_per_checkout,
      e.capacity_hold_hours_override,
      e.manual_payment_enabled,
      e.timezone,
      e.cover_image_url,
      e.banner_image_url,
      e.gallery_json,
      e.google_maps_url,
      e.max_attendees,
      v.name_en AS venue_name_en,
      v.name_ar AS venue_name_ar,
      v.city_en AS venue_city_en,
      v.city_ar AS venue_city_ar,
      v.address_en AS venue_address_en,
      v.address_ar AS venue_address_ar,
      v.capacity AS venue_capacity
    FROM events e
    LEFT JOIN venues v ON v.id = e.venue_id
  `;
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

async function currentPricePeriod(connection, ticketTypeId, currency) {
  const [rows] = await connection.execute(`
    SELECT id, label_en, label_ar, price, price_egp, price_usd, currency, starts_at, ends_at
    FROM ticket_price_periods
    WHERE ticket_type_id = :ticketTypeId
      AND is_active = 1
      AND starts_at <= NOW()
      AND ends_at >= NOW()
    ORDER BY starts_at DESC
    LIMIT 1
  `, { ticketTypeId });

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    selected_currency: currency,
    selected_price: currency === 'EGP' ? Number(row.price_egp ?? row.price) : Number(row.price_usd ?? row.price),
  };
}

async function issueTicket(connection, registration) {
  const [existingAttendees] = await connection.execute(
    'SELECT id, qr_token FROM attendees WHERE order_id = :orderId AND event_id = :eventId AND ticket_type_id = :ticketTypeId LIMIT 1',
    { orderId: registration.order_id, eventId: registration.event_id, ticketTypeId: registration.ticket_type_id }
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
  if (existingTickets[0]) return { ticketId: existingTickets[0].id, ticketNumber: existingTickets[0].ticket_number };

  const nextTicketNumber = ticketNumber();
  const [ticketResult] = await connection.execute(`
    INSERT INTO generated_tickets (registration_id, attendee_id, ticket_number, qr_token, generated_at)
    VALUES (:registrationId, :attendeeId, :ticketNumber, :qrToken, NOW())
  `, {
    registrationId: registration.id,
    attendeeId,
    ticketNumber: nextTicketNumber,
    qrToken: token,
  });

  return { ticketId: ticketResult.insertId, ticketNumber: nextTicketNumber };
}

async function registrationSummary(registrationId) {
  return first(`
    SELECT
      r.registration_number,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      r.payment_reference,
      r.payment_proof_url,
      r.reservation_expires_at,
      r.capacity_reservation_status,
      r.capacity_released_at,
      r.capacity_release_reason,
      r.created_at,
      d.full_name,
      d.email,
      d.mobile,
      e.slug AS event_slug,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      CASE WHEN gt.id IS NULL THEN NULL ELSE gt.ticket_number END AS ticket_number,
      CASE
        WHEN gt.id IS NULL THEN 'not_issued'
        WHEN a.checked_in_at IS NOT NULL OR a.qr_status = 'used' THEN 'used'
        WHEN a.qr_status = 'revoked' THEN 'revoked'
        ELSE 'active'
      END AS ticket_status
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    WHERE r.id = :registrationId
    LIMIT 1
  `, { registrationId });
}

router.get('/registrations/:reference', asyncRoute(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Referrer-Policy', 'no-referrer');
  const row = await first(`
    SELECT
      r.id,
      d.user_id,
      pcs.confirmation_token_hash,
      pcs.confirmation_token_expires_at
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    LEFT JOIN public_checkout_sessions pcs ON pcs.registration_id = r.id
    WHERE r.registration_number = :reference
    LIMIT 1
  `, { reference: req.params.reference });
  if (!row) return fail(res, 404, 'Registration not found');

  const authenticatedOwner = req.user?.id && Number(row.user_id || 0) === Number(req.user.id);
  if (!authenticatedOwner) {
    const cookieName = confirmationCookieName(req.params.reference);
    const token = String(req.query.token || '') || cookieValue(req, cookieName);
    const hasValidToken = row.confirmation_token_hash
      && token
      && crypto.timingSafeEqual(Buffer.from(row.confirmation_token_hash), Buffer.from(tokenHash(token)))
      && (!row.confirmation_token_expires_at || new Date(row.confirmation_token_expires_at).getTime() > Date.now());

    if (!hasValidToken) return fail(res, 403, 'Confirmation access denied');
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: `/api/public/events/registrations/${encodeURIComponent(req.params.reference)}`,
    });
  }

  await query('UPDATE public_checkout_sessions SET confirmed_at = COALESCE(confirmed_at, NOW()) WHERE registration_id = :registrationId', {
    registrationId: row.id,
  });

  ok(res, { registration: await registrationSummary(row.id) });
}));

router.get('/:slug', asyncRoute(async (req, res) => {
  const event = await first(`${publicEventSelect()} WHERE e.slug = :slug AND e.status = 'published' LIMIT 1`, {
    slug: req.params.slug,
  });
  if (!event) return fail(res, 404, 'Event not found');
  await transaction(async (connection) => {
    await releaseExpiredReservations(connection, { eventId: event.id });
  });

  const [sessions, tickets, totals] = await Promise.all([
    query(`
      SELECT id, title_en, title_ar, speaker_name, starts_at, ends_at, room_name
      FROM event_sessions
      WHERE event_id = :eventId
      ORDER BY starts_at ASC
    `, { eventId: event.id }),
    query(`
      SELECT
        tt.id,
        tt.name_en,
        tt.name_ar,
        tt.description_en,
        tt.description_ar,
        tt.quota,
        tt.per_order_limit,
        COALESCE(active_regs.sold_count, 0) AS sold_count,
        tpp.id AS price_period_id,
        tpp.label_en AS price_label_en,
        tpp.label_ar AS price_label_ar,
        tpp.price,
        tpp.price_egp,
        tpp.price_usd,
        tpp.currency,
        tpp.starts_at AS price_starts_at,
        tpp.ends_at AS price_ends_at
      FROM ticket_types tt
      LEFT JOIN (
        SELECT ticket_type_id, COUNT(*) AS sold_count
        FROM registrations
        WHERE event_id = :eventId
          AND registration_status NOT IN ('rejected', 'cancelled', 'expired')
          AND COALESCE(capacity_reservation_status, 'active') = 'active'
        GROUP BY ticket_type_id
      ) active_regs ON active_regs.ticket_type_id = tt.id
      LEFT JOIN ticket_price_periods tpp ON tpp.id = (
        SELECT ipp.id
        FROM ticket_price_periods ipp
        WHERE ipp.ticket_type_id = tt.id
          AND ipp.is_active = 1
          AND ipp.starts_at <= NOW()
          AND ipp.ends_at >= NOW()
        ORDER BY ipp.starts_at DESC
        LIMIT 1
      )
      WHERE tt.event_id = :eventId AND tt.is_active = 1
      ORDER BY tt.created_at ASC
    `, { eventId: event.id }),
    first(`
      SELECT COUNT(*) AS reserved_count
      FROM registrations
      WHERE event_id = :eventId
        AND registration_status NOT IN ('rejected', 'cancelled', 'expired')
        AND COALESCE(capacity_reservation_status, 'active') = 'active'
    `, { eventId: event.id }),
  ]);

  const soldOut = event.max_attendees ? Number(totals?.reserved_count || 0) >= Number(event.max_attendees) : false;
  ok(res, {
    event: {
      ...event,
      gallery: event.gallery_json ? JSON.parse(event.gallery_json) : [],
      state: eventState(event, soldOut),
      registration_policy: normalizeEventPolicy(event),
      reserved_count: Number(totals?.reserved_count || 0),
    },
    sessions,
    tickets: tickets.map((ticket) => ({
      ...ticket,
      sold_count: Number(ticket.sold_count || 0),
      remaining: ticket.quota ? Math.max(Number(ticket.quota) - Number(ticket.sold_count || 0), 0) : null,
      is_sold_out: Boolean(ticket.quota && Number(ticket.sold_count || 0) >= Number(ticket.quota)),
    })),
  });
}));

router.post('/:slug/checkout', asyncRoute(async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const input = {
    ...parsed.data,
    address: parsed.data.address || null,
    paymentReference: parsed.data.paymentReference || null,
    paymentProofUrl: parsed.data.paymentProofUrl || null,
  };
  const hash = payloadHash({ ...input, slug: req.params.slug });

  const existingSession = await first(`
    SELECT registration_id, payload_hash, confirmation_token_expires_at FROM public_checkout_sessions
    WHERE session_key = :sessionKey AND status = 'completed' AND registration_id IS NOT NULL
    LIMIT 1
  `, { sessionKey: input.idempotencyKey });
  if (existingSession) {
    if (existingSession.payload_hash !== hash) return fail(res, 409, 'Idempotency key already used with different checkout data');
    const newToken = confirmationToken();
    await query(`
      UPDATE public_checkout_sessions
      SET confirmation_token_hash = :tokenHash,
          confirmation_token_expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY)
      WHERE session_key = :sessionKey
    `, { tokenHash: tokenHash(newToken), sessionKey: input.idempotencyKey });
    return ok(res, {
      registration: await registrationSummary(existingSession.registration_id),
      confirmationToken: newToken,
      confirmationExpiresAt: existingSession.confirmation_token_expires_at,
      repeated: true,
    }, 'Checkout already completed');
  }

  let created;
  try {
    created = await transaction(async (connection) => {
      const [events] = await connection.execute(`${publicEventSelect()} WHERE e.slug = :slug AND e.status = 'published' LIMIT 1 FOR UPDATE`, {
        slug: req.params.slug,
      });
      const event = events[0];
      if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }
      const policy = normalizeEventPolicy(event);
      if (!policy.publicRegistrationEnabled) {
        const error = new Error('Public registration is disabled for this event');
        error.statusCode = 409;
        error.details = { state: 'disabled' };
        throw error;
      }
      if (policy.access === 'login_required' && !req.user?.id) {
        const error = new Error('Login is required for this event registration');
        error.statusCode = 401;
        error.details = { state: 'login_required' };
        throw error;
      }
      if (input.quantity > policy.maxTicketsPerCheckout) {
        const error = new Error(`Maximum tickets per checkout is ${policy.maxTicketsPerCheckout}`);
        error.statusCode = 400;
        error.details = { maxTicketsPerCheckout: policy.maxTicketsPerCheckout };
        throw error;
      }

      const [tickets] = await connection.execute(`
        SELECT id, event_id, name_en, name_ar, quota, per_order_limit, is_active
        FROM ticket_types
        WHERE id = :ticketTypeId AND event_id = :eventId AND is_active = 1
        LIMIT 1 FOR UPDATE
      `, { ticketTypeId: input.ticketTypeId, eventId: event.id });
      const ticket = tickets[0];
      if (!ticket) {
        const error = new Error('Ticket type is not available');
        error.statusCode = 404;
        throw error;
      }

      await releaseExpiredReservations(connection, { eventId: event.id, ticketTypeId: ticket.id });
      const { ticketReservedCount, eventReservedCount } = await countActiveReservations(connection, event.id, ticket.id);
      const ticketSoldOut = Boolean(ticket.quota && ticketReservedCount + input.quantity > Number(ticket.quota));
      const eventSoldOut = Boolean(event.max_attendees && eventReservedCount + input.quantity > Number(event.max_attendees));
      const soldOut = ticketSoldOut || eventSoldOut;
      const state = eventState(event, soldOut);
      if (state !== 'open') {
        const error = new Error(`Registration is ${state}`);
        error.statusCode = 409;
        error.details = { state };
        throw error;
      }

      const newConfirmationToken = confirmationToken();
      await connection.execute(`
        INSERT INTO public_checkout_sessions (
          session_key, payload_hash, confirmation_token_hash, confirmation_token_expires_at,
          event_id, ticket_type_id, customer_email, status, expires_at
        )
        VALUES (
          :sessionKey, :payloadHash, :confirmationTokenHash, DATE_ADD(NOW(), INTERVAL 7 DAY),
          :eventId, :ticketTypeId, :customerEmail, 'pending', DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        )
      `, {
        sessionKey: input.idempotencyKey,
        payloadHash: hash,
        confirmationTokenHash: tokenHash(newConfirmationToken),
        eventId: event.id,
        ticketTypeId: ticket.id,
        customerEmail: input.email,
      });

      const [existingDoctors] = await connection.execute('SELECT id FROM doctors WHERE email = :email LIMIT 1', { email: input.email });
      let doctorId = existingDoctors[0]?.id;
      if (doctorId) {
        await connection.execute(`
          UPDATE doctors
          SET full_name = :fullName, mobile = :mobile, address = :address, country_code = :countryCode,
              country_name = :countryName, city = :city, specialty = :specialty,
              nationality = :nationality, preferred_language = :preferredLanguage, updated_at = NOW()
          WHERE id = :doctorId
        `, { ...input, doctorId });
      } else {
        const [doctorResult] = await connection.execute(`
          INSERT INTO doctors (
            full_name, mobile, email, address, country_code, country_name, city, specialty, nationality, preferred_language
          )
          VALUES (
            :fullName, :mobile, :email, :address, :countryCode, :countryName, :city, :specialty, :nationality, :preferredLanguage
          )
        `, input);
        doctorId = doctorResult.insertId;
      }

      const currency = isEgyptianCountry(input.countryCode, input.countryName, input.nationality) ? 'EGP' : 'USD';
      const pricePeriod = await currentPricePeriod(connection, ticket.id, currency);
      if (!pricePeriod) {
        const error = new Error('No active price period is available for this ticket');
        error.statusCode = 409;
        throw error;
      }

      const isFree = Number(pricePeriod.selected_price) <= 0;
      if (!isFree && !policy.manualPaymentEnabled) {
        const error = new Error('Manual payment is not enabled for this event');
        error.statusCode = 409;
        error.details = { state: 'payment_unavailable' };
        throw error;
      }
      const initialState = checkoutInitialState({
        isFree,
        hasPaymentProof: Boolean(input.paymentProofUrl),
        approvalMode: policy.approvalMode,
      });

      const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          event_id, order_number, status, subtotal, grand_total, currency, customer_name, customer_email, customer_phone
        )
        VALUES (
          :eventId, :orderNumber, :status, :subtotal, :grandTotal, :currency, :customerName, :customerEmail, :customerPhone
        )
      `, {
        eventId: event.id,
        orderNumber: orderNumber(),
        status: initialState.orderStatus,
        subtotal: pricePeriod.selected_price,
        grandTotal: pricePeriod.selected_price,
        currency: pricePeriod.selected_currency,
        customerName: input.fullName,
        customerEmail: input.email,
        customerPhone: input.mobile,
      });

      const nextRegistrationNumber = registrationNumber();
      const [registrationResult] = await connection.execute(`
        INSERT INTO registrations (
          registration_number, doctor_id, event_id, ticket_type_id, order_id, source,
          registration_status, payment_status, selected_currency, selected_price,
          selected_price_period_id, payment_reference, payment_proof_url,
          reservation_expires_at, capacity_reservation_status
        )
        VALUES (
          :registrationNumber, :doctorId, :eventId, :ticketTypeId, :orderId, 'online',
          :registrationStatus, :paymentStatus, :selectedCurrency, :selectedPrice,
          :pricePeriodId, :paymentReference, :paymentProofUrl,
          ${isFree ? 'NULL' : reservationExpirySql(policy.capacityHoldHoursOverride)}, :capacityReservationStatus
        )
      `, {
        registrationNumber: nextRegistrationNumber,
        doctorId,
        eventId: event.id,
        ticketTypeId: ticket.id,
        orderId: orderResult.insertId,
        registrationStatus: initialState.registrationStatus,
        paymentStatus: initialState.paymentStatus,
        selectedCurrency: pricePeriod.selected_currency,
        selectedPrice: pricePeriod.selected_price,
        pricePeriodId: pricePeriod.id,
        paymentReference: input.paymentReference,
        paymentProofUrl: input.paymentProofUrl,
        capacityReservationStatus: isFree ? 'active' : 'active',
      });

      const registration = {
        id: registrationResult.insertId,
        order_id: orderResult.insertId,
        event_id: event.id,
        ticket_type_id: ticket.id,
        full_name: input.fullName,
        email: input.email,
        mobile: input.mobile,
        specialty: input.specialty,
      };
      if (initialState.shouldIssueTicket) await issueTicket(connection, registration);

      await connection.execute(`
        UPDATE public_checkout_sessions
        SET registration_id = :registrationId, status = 'completed'
        WHERE session_key = :sessionKey
      `, { registrationId: registration.id, sessionKey: input.idempotencyKey });

      return {
        registrationId: registration.id,
        currency: pricePeriod.selected_currency,
        price: pricePeriod.selected_price,
        isFree,
        confirmationToken: newConfirmationToken,
      };
    });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      const duplicate = await first(`
        SELECT registration_id, payload_hash, status FROM public_checkout_sessions
        WHERE session_key = :sessionKey
        LIMIT 1
      `, { sessionKey: input.idempotencyKey });
      if (duplicate?.payload_hash && duplicate.payload_hash !== hash) {
        return fail(res, 409, 'Idempotency key already used with different checkout data');
      }
      if (duplicate?.registration_id) {
        const newToken = confirmationToken();
        await query(`
          UPDATE public_checkout_sessions
          SET confirmation_token_hash = :tokenHash,
              confirmation_token_expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY)
          WHERE session_key = :sessionKey
        `, { tokenHash: tokenHash(newToken), sessionKey: input.idempotencyKey });
        return ok(res, {
          registration: await registrationSummary(duplicate.registration_id),
          confirmationToken: newToken,
          confirmationExpiresInSeconds: 604800,
          repeated: true,
        }, 'Checkout already completed');
      }
      return fail(res, 409, 'Checkout request is already being processed');
    }
    return fail(res, error.statusCode || 500, error.message || 'Checkout failed', error.details);
  }

  const bankAccount = created.isFree ? null : await activeBankAccount(created.currency);
  ok(res, {
    registration: await registrationSummary(created.registrationId),
    bankAccount,
    checkout: { currency: created.currency, price: created.price, isFree: created.isFree },
    confirmationToken: created.confirmationToken,
    confirmationExpiresInSeconds: 604800,
  }, created.isFree ? 'Free registration confirmed and ticket issued' : 'Registration created. Payment is pending verification.');
}));

export default router;
