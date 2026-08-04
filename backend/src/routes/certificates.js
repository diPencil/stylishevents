import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { first, query, transaction } from '../db/mysql.js';
import { requireAuth, requireAnyPermission, requirePermission } from '../middleware/auth.js';
import { eventScopeCondition, requireEventScope } from '../auth/scope.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const templateSchema = z.object({
  eventId: z.number().int().positive(),
  name: z.string().min(2),
  templateType: z.enum(['image', 'pdf']).default('image'),
  templateUrl: z.string().min(2),
  fieldPositions: z.record(z.any()).default({}),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const issueSchema = z.object({
  attendeeId: z.number().int().positive(),
  templateKey: z.string().min(2).default('default'),
  fileUrl: z.string().optional().nullable(),
});

function certificateNumber() {
  return `CERT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function cardNumber() {
  return `CARD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

router.get('/templates', requireAuth, requireAnyPermission(['certificates.view', 'certificates.manage']), asyncRoute(async (req, res) => {
  const eventId = Number(req.query.eventId || 0);
  if (eventId && !(await requireEventScope(req, res, eventId))) return;
  const scope = eventScopeCondition(req.user, 'e');
  const rows = await query(`
    SELECT
      ct.id,
      ct.event_id,
      ct.name,
      ct.template_type,
      ct.template_url,
      ct.field_positions_json,
      ct.is_default,
      ct.is_active,
      ct.created_at,
      ct.updated_at
    FROM certificate_templates ct
    JOIN events e ON e.id = ct.event_id
    WHERE (:eventId = 0 OR ct.event_id = :eventId)
      AND (${scope.clause})
    ORDER BY ct.is_default DESC, ct.updated_at DESC
  `, { eventId, ...scope.params });

  ok(res, rows);
}));

router.get('/delivery', requireAuth, requireAnyPermission(['certificates.view', 'certificates.manage']), asyncRoute(async (req, res) => {
  const eventId = Number(req.query.eventId || 0);
  if (eventId && !(await requireEventScope(req, res, eventId))) return;
  const scope = eventScopeCondition(req.user, 'e');
  const rows = await query(`
    SELECT
      a.id AS attendee_id,
      a.attendee_number,
      a.full_name,
      a.email,
      a.checked_in_at,
      a.certificate_issued_at,
      e.id AS event_id,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      c.id AS certificate_id,
      c.certificate_number,
      c.status AS certificate_status,
      c.file_url AS certificate_file_url,
      c.issued_at AS certificate_sent_at,
      ec.id AS card_id,
      ec.card_number,
      ec.file_url AS card_file_url,
      ec.created_at AS card_sent_at
    FROM attendees a
    JOIN events e ON e.id = a.event_id
    JOIN ticket_types tt ON tt.id = a.ticket_type_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    LEFT JOIN event_cards ec ON ec.attendee_id = a.id
    WHERE (:eventId = 0 OR a.event_id = :eventId)
      AND (${scope.clause})
    ORDER BY a.created_at DESC
    LIMIT 500
  `, { eventId, ...scope.params });

  ok(res, rows);
}));

router.post('/templates', requireAuth, requirePermission('certificates.manage'), asyncRoute(async (req, res) => {
  const parsed = templateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());
  if (!(await requireEventScope(req, res, parsed.data.eventId))) return;

  const template = parsed.data;
  const result = await transaction(async (connection) => {
    if (template.isDefault) {
      await connection.execute(
        'UPDATE certificate_templates SET is_default = 0 WHERE event_id = :eventId',
        { eventId: template.eventId }
      );
    }

    const [insertResult] = await connection.execute(`
      INSERT INTO certificate_templates (
        event_id,
        name,
        template_type,
        template_url,
        field_positions_json,
        is_default,
        is_active
      )
      VALUES (
        :eventId,
        :name,
        :templateType,
        :templateUrl,
        :fieldPositions,
        :isDefault,
        :isActive
      )
    `, {
      ...template,
      fieldPositions: JSON.stringify(template.fieldPositions),
    });

    return insertResult;
  });

  ok(res, { id: result.insertId, ...template }, 'Certificate template saved');
}));

router.patch('/templates/:id/status', requireAuth, requirePermission('certificates.manage'), asyncRoute(async (req, res) => {
  const isActive = Boolean(req.body.isActive);
  const template = await first('SELECT id, event_id FROM certificate_templates WHERE id = :id LIMIT 1', { id: Number(req.params.id) });
  if (!template) return fail(res, 404, 'Template not found');
  if (!(await requireEventScope(req, res, template.event_id))) return;
  await query(`
    UPDATE certificate_templates
    SET is_active = :isActive
    WHERE id = :id
  `, { id: Number(req.params.id), isActive });

  ok(res, { id: Number(req.params.id), isActive }, 'Template status updated');
}));

router.post('/issue', requireAuth, requirePermission('certificates.manage'), asyncRoute(async (req, res) => {
  const parsed = issueSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const attendee = await first(`
    SELECT
      a.id,
      a.event_id,
      a.full_name,
      a.checked_in_at,
      e.title_en AS event_title_en
    FROM attendees a
    JOIN events e ON e.id = a.event_id
    WHERE a.id = :attendeeId
  `, { attendeeId: parsed.data.attendeeId });

  if (!attendee) return fail(res, 404, 'Attendee not found');
  if (!(await requireEventScope(req, res, attendee.event_id))) return;
  if (!attendee.checked_in_at) return fail(res, 422, 'Certificate can be issued after check-in');

  const issued = await transaction(async (connection) => {
    const [existing] = await connection.execute(
      'SELECT id, certificate_number FROM certificates WHERE attendee_id = :attendeeId LIMIT 1',
      { attendeeId: attendee.id }
    );

    if (existing[0]) {
      await connection.execute(`
        UPDATE certificates
        SET
          status = 'issued',
          template_key = :templateKey,
          file_url = :fileUrl,
          issued_at = NOW()
        WHERE id = :id
      `, {
        id: existing[0].id,
        templateKey: parsed.data.templateKey,
        fileUrl: parsed.data.fileUrl || null,
      });

      return {
        id: existing[0].id,
        certificateNumber: existing[0].certificate_number,
      };
    }

    const nextCertificateNumber = certificateNumber();
    const [insertResult] = await connection.execute(`
      INSERT INTO certificates (
        attendee_id,
        certificate_number,
        template_key,
        file_url,
        status,
        issued_at
      )
      VALUES (
        :attendeeId,
        :certificateNumber,
        :templateKey,
        :fileUrl,
        'issued',
        NOW()
      )
    `, {
      attendeeId: attendee.id,
      certificateNumber: nextCertificateNumber,
      templateKey: parsed.data.templateKey,
      fileUrl: parsed.data.fileUrl || null,
    });

    return {
      id: insertResult.insertId,
      certificateNumber: nextCertificateNumber,
    };
  });

  ok(res, issued, 'Certificate issued');
}));

router.post('/event-card', requireAuth, requirePermission('certificates.manage'), asyncRoute(async (req, res) => {
  const attendeeId = Number(req.body.attendeeId || 0);
  const templateKey = String(req.body.templateKey || 'default');
  const fileUrl = req.body.fileUrl || null;
  if (!attendeeId) return fail(res, 400, 'Attendee is required');

  const attendee = await first('SELECT id, event_id FROM attendees WHERE id = :attendeeId', { attendeeId });
  if (!attendee) return fail(res, 404, 'Attendee not found');
  if (!(await requireEventScope(req, res, attendee.event_id))) return;

  const created = await transaction(async (connection) => {
    const [existing] = await connection.execute(
      'SELECT id, card_number FROM event_cards WHERE attendee_id = :attendeeId LIMIT 1',
      { attendeeId }
    );

    if (existing[0]) {
      await connection.execute(`
        UPDATE event_cards
        SET template_key = :templateKey, file_url = :fileUrl
        WHERE id = :id
      `, { id: existing[0].id, templateKey, fileUrl });

      return { id: existing[0].id, cardNumber: existing[0].card_number };
    }

    const nextCardNumber = cardNumber();
    const [insertResult] = await connection.execute(`
      INSERT INTO event_cards (
        attendee_id,
        card_number,
        template_key,
        file_url
      )
      VALUES (
        :attendeeId,
        :cardNumber,
        :templateKey,
        :fileUrl
      )
    `, { attendeeId, cardNumber: nextCardNumber, templateKey, fileUrl });

    return { id: insertResult.insertId, cardNumber: nextCardNumber };
  });

  ok(res, created, 'Event card generated');
}));

export default router;
