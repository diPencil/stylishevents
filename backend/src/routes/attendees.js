import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { first, query, transaction } from '../db/mysql.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { eventScopeCondition, requireEventScope } from '../auth/scope.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const attendeeSchema = z.object({
  orderId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  ticketTypeId: z.number().int().positive(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
});

function attendeeNumber() {
  return `ATT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function qrToken() {
  return crypto.randomBytes(32).toString('hex');
}

router.get('/', requireAuth, requirePermission('attendees.manage'), asyncRoute(async (req, res) => {
  const eventId = Number(req.query.eventId || 0);
  if (eventId && !(await requireEventScope(req, res, eventId))) return;
  const scope = eventScopeCondition(req.user, 'e');

  const rows = await query(`
    SELECT
      a.id,
      a.attendee_number,
      a.full_name,
      a.email,
      a.phone,
      a.job_title,
      a.organization,
      a.qr_token,
      a.qr_status,
      a.checked_in_at,
      a.certificate_issued_at,
      a.created_at,
      a.event_id,
      a.ticket_type_id,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar
    FROM attendees a
    JOIN events e ON e.id = a.event_id
    JOIN ticket_types tt ON tt.id = a.ticket_type_id
    WHERE (:eventId = 0 OR a.event_id = :eventId)
      AND (${scope.clause})
    ORDER BY a.created_at DESC
    LIMIT 250
  `, { eventId, ...scope.params });

  ok(res, rows);
}));

router.get('/:id', requireAuth, requirePermission('attendees.manage'), asyncRoute(async (req, res) => {
  const attendee = await first(`
    SELECT
      a.id,
      a.order_id,
      a.event_id,
      a.ticket_type_id,
      a.attendee_number,
      a.full_name,
      a.email,
      a.phone,
      a.job_title,
      a.organization,
      a.qr_token,
      a.qr_status,
      a.checked_in_at,
      a.certificate_issued_at,
      a.created_at,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      gt.ticket_number,
      gt.pdf_url AS ticket_pdf_url,
      c.certificate_number,
      c.status AS certificate_status,
      c.file_url AS certificate_file_url,
      ec.card_number,
      ec.file_url AS card_file_url
    FROM attendees a
    JOIN events e ON e.id = a.event_id
    JOIN ticket_types tt ON tt.id = a.ticket_type_id
    LEFT JOIN generated_tickets gt ON gt.attendee_id = a.id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    LEFT JOIN event_cards ec ON ec.attendee_id = a.id
    WHERE a.id = :id
    LIMIT 1
  `, { id: Number(req.params.id) });

  if (!attendee) return fail(res, 404, 'Attendee not found');
  if (!(await requireEventScope(req, res, attendee.event_id))) return;
  ok(res, attendee);
}));

router.post('/', requireAuth, requirePermission('attendees.manage'), asyncRoute(async (req, res) => {
  const parsed = attendeeSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());
  if (!(await requireEventScope(req, res, parsed.data.eventId))) return;

  const attendee = {
    ...parsed.data,
    attendeeNumber: attendeeNumber(),
    qrToken: qrToken(),
  };

  const result = await query(`
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
      :phone,
      :jobTitle,
      :organization,
      :qrToken
    )
  `, attendee);

  ok(res, { id: result.insertId, ...attendee }, 'Attendee created');
}));

router.post('/checkin', requireAuth, requirePermission('checkin.manage'), asyncRoute(async (req, res) => {
  const token = String(req.body.qrToken || '');
  if (!token) return fail(res, 400, 'QR token is required');

  const attendee = await first(`
    SELECT id, event_id, full_name, qr_status, checked_in_at
    FROM attendees
    WHERE qr_token = :token
  `, { token });

  if (!attendee) return fail(res, 404, 'Invalid QR code', { result: 'invalid' });
  if (!(await requireEventScope(req, res, attendee.event_id))) return;
  if (attendee.checked_in_at) {
    await query(`
      INSERT INTO checkin_logs (attendee_id, event_id, scan_result, notes)
      VALUES (:attendeeId, :eventId, 'duplicate', 'Already checked in')
    `, { attendeeId: attendee.id, eventId: attendee.event_id });
    return fail(res, 409, 'Attendee already checked in', { result: 'duplicate', attendee });
  }

  if (attendee.qr_status !== 'active') {
    await query(`
      INSERT INTO checkin_logs (attendee_id, event_id, scan_result, notes)
      VALUES (:attendeeId, :eventId, 'revoked', 'QR is not active')
    `, { attendeeId: attendee.id, eventId: attendee.event_id });
    return fail(res, 409, 'QR code is not active', { result: 'revoked' });
  }

  const checkedIn = await transaction(async (connection) => {
    await connection.execute(`
      UPDATE attendees
      SET checked_in_at = NOW(), qr_status = 'used'
      WHERE id = :attendeeId
    `, { attendeeId: attendee.id });

    await connection.execute(`
      INSERT INTO checkin_logs (attendee_id, event_id, scan_result)
      VALUES (:attendeeId, :eventId, 'accepted')
    `, { attendeeId: attendee.id, eventId: attendee.event_id });

    const [rows] = await connection.execute(`
      SELECT id, attendee_number, full_name, email, checked_in_at
      FROM attendees
      WHERE id = :attendeeId
    `, { attendeeId: attendee.id });

    return rows[0];
  });

  ok(res, checkedIn, 'Check-in accepted');
}));

router.patch('/:id/qr-status', requireAuth, requirePermission('attendees.manage'), asyncRoute(async (req, res) => {
  const status = ['active', 'revoked', 'used'].includes(req.body.status) ? req.body.status : null;
  if (!status) return fail(res, 400, 'Invalid QR status');
  const attendee = await first('SELECT id, event_id FROM attendees WHERE id = :id LIMIT 1', { id: Number(req.params.id) });
  if (!attendee) return fail(res, 404, 'Attendee not found');
  if (!(await requireEventScope(req, res, attendee.event_id))) return;

  await query('UPDATE attendees SET qr_status = :status WHERE id = :id', {
    id: Number(req.params.id),
    status,
  });

  ok(res, { id: Number(req.params.id), status }, 'Attendee QR status updated');
}));

export default router;
