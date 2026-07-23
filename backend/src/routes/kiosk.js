import express from 'express';
import { z } from 'zod';
import { first, query } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const searchSchema = z.object({
  eventId: z.number().int().positive().optional().nullable(),
  searchType: z.enum(['email', 'mobile', 'registration_number']),
  searchValue: z.string().min(2),
});

function searchCondition(searchType) {
  if (searchType === 'email') return 'd.email = :searchValue';
  if (searchType === 'mobile') return 'd.mobile = :searchValue';
  return 'r.registration_number = :searchValue';
}

router.post('/search', asyncRoute(async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const input = {
    eventId: Number(parsed.data.eventId || 0),
    searchType: parsed.data.searchType,
    searchValue: parsed.data.searchValue.trim(),
  };

  const registration = await first(`
    SELECT
      r.id,
      r.registration_number,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      d.full_name AS doctor_name,
      d.mobile AS doctor_mobile,
      d.email AS doctor_email,
      d.specialty,
      d.nationality,
      e.id AS event_id,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      a.attendee_number,
      a.checked_in_at,
      gt.ticket_number,
      gt.qr_token,
      gt.pdf_url AS ticket_pdf_url,
      ec.card_number,
      ec.file_url AS event_card_url
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN event_cards ec ON ec.attendee_id = a.id
    WHERE ${searchCondition(input.searchType)}
      AND (:eventId = 0 OR r.event_id = :eventId)
    ORDER BY r.created_at DESC
    LIMIT 1
  `, input);

  await query(`
    INSERT INTO kiosk_search_logs (
      event_id,
      search_type,
      search_value,
      result_status,
      matched_registration_id
    )
    VALUES (
      :eventIdForLog,
      :searchType,
      :searchValue,
      :resultStatus,
      :matchedRegistrationId
    )
  `, {
    eventIdForLog: input.eventId || registration?.event_id || null,
    searchType: input.searchType,
    searchValue: input.searchValue,
    resultStatus: registration ? 'found' : 'not_found',
    matchedRegistrationId: registration?.id || null,
  });

  if (!registration) return fail(res, 404, 'Registration not found');
  if (registration.payment_status !== 'approved') {
    return fail(res, 409, 'Payment is not approved yet', { registration });
  }

  ok(res, registration, 'Registration found');
}));

export default router;
