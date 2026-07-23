import express from 'express';
import { z } from 'zod';
import { first, query } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const doctorSchema = z.object({
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
});

router.get('/', asyncRoute(async (req, res) => {
  const search = String(req.query.search || '').trim();

  const doctors = await query(`
    SELECT
      id,
      full_name,
      mobile,
      email,
      country_code,
      country_name,
      city,
      specialty,
      nationality,
      preferred_language,
      status,
      created_at
    FROM doctors
    ${search ? `
      WHERE full_name LIKE :search
        OR email LIKE :search
        OR mobile LIKE :search
        OR specialty LIKE :search
    ` : ''}
    ORDER BY created_at DESC
    LIMIT 250
  `, { search: `%${search}%` });

  ok(res, doctors);
}));

router.get('/lookup/profile', asyncRoute(async (req, res) => {
  const identity = String(req.query.identity || '').trim();
  if (identity.length < 3) return fail(res, 400, 'Email, mobile, or registration number is required');

  const doctor = await first(`
    SELECT DISTINCT
      d.*,
      COUNT(DISTINCT r.id) AS registrations_count,
      COUNT(DISTINCT gt.id) AS tickets_count,
      COUNT(DISTINCT c.id) AS certificates_count
    FROM doctors d
    LEFT JOIN registrations r ON r.doctor_id = d.id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    WHERE d.email = :identity
      OR d.mobile = :identity
      OR r.registration_number = :identity
    GROUP BY d.id
    LIMIT 1
  `, { identity });

  if (!doctor) return fail(res, 404, 'Doctor profile not found');

  const history = await query(`
    SELECT
      r.id,
      r.registration_number,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      r.payment_reference,
      r.payment_proof_url,
      r.created_at,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      gt.ticket_number,
      gt.qr_token,
      gt.pdf_url AS ticket_pdf_url,
      c.certificate_number,
      c.file_url AS certificate_file_url,
      c.status AS certificate_status
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    WHERE r.doctor_id = :id
    ORDER BY r.created_at DESC
  `, { id: doctor.id });

  ok(res, { doctor, history });
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const doctor = await first(`
    SELECT
      d.*,
      COUNT(DISTINCT r.id) AS registrations_count,
      COUNT(DISTINCT gt.id) AS tickets_count,
      COUNT(DISTINCT c.id) AS certificates_count
    FROM doctors d
    LEFT JOIN registrations r ON r.doctor_id = d.id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    WHERE d.id = :id
    GROUP BY d.id
  `, { id: Number(req.params.id) });

  if (!doctor) return fail(res, 404, 'Doctor not found');

  const history = await query(`
    SELECT
      r.id,
      r.registration_number,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      gt.ticket_number,
      gt.pdf_url AS ticket_pdf_url,
      c.certificate_number,
      c.file_url AS certificate_file_url,
      c.status AS certificate_status
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    WHERE r.doctor_id = :id
    ORDER BY r.created_at DESC
  `, { id: Number(req.params.id) });

  ok(res, { doctor, history });
}));

router.post('/', asyncRoute(async (req, res) => {
  const parsed = doctorSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const doctor = parsed.data;
  const existing = await first('SELECT id FROM doctors WHERE email = :email', { email: doctor.email });
  if (existing) return fail(res, 409, 'Doctor email already exists', { id: existing.id });

  const result = await query(`
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
  `, doctor);

  ok(res, { id: result.insertId, ...doctor }, 'Doctor profile created');
}));

export default router;
