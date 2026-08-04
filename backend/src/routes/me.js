import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { first, query } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(120).optional().default(''),
  status: z.string().trim().max(60).optional().default(''),
  period: z.enum(['all', 'upcoming', 'past']).optional().default('all'),
});

function paging(queryParams) {
  const parsed = listSchema.safeParse(queryParams || {});
  if (!parsed.success) return { error: parsed.error };
  const { page, perPage, search, status, period } = parsed.data;
  return { page, perPage, offset: (page - 1) * perPage, search, status, period };
}

function userScopeSql(alias = 'd') {
  return `${alias}.user_id = :userId`;
}

function baseParams(req, extra = {}) {
  return { userId: req.user.id, userEmail: req.user.email, ...extra };
}

function numericId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

async function customerRegistrations(req, options = {}) {
  const pageState = paging(options);
  if (pageState.error) {
    const error = new Error('Invalid list query');
    error.statusCode = 400;
    error.details = pageState.error.flatten();
    throw error;
  }
  const { perPage, offset, search, status, period } = pageState;
  const filters = [userScopeSql('d')];
  const params = baseParams(req, {
    limit: perPage,
    offset,
    searchLike: `%${search}%`,
    status,
    now: new Date(),
  });

  if (search) {
    filters.push('(r.registration_number LIKE :searchLike OR e.title_en LIKE :searchLike OR e.title_ar LIKE :searchLike OR tt.name_en LIKE :searchLike OR tt.name_ar LIKE :searchLike)');
  }
  if (status) filters.push('(r.registration_status = :status OR r.payment_status = :status OR o.status = :status)');
  if (Array.isArray(options.registrationStatuses) && options.registrationStatuses.length) {
    const statusKeys = options.registrationStatuses.map((value, index) => {
      const key = `registrationStatus${index}`;
      params[key] = value;
      return `:${key}`;
    });
    filters.push(`r.registration_status IN (${statusKeys.join(', ')})`);
  }
  if (period === 'upcoming') filters.push('e.starts_at >= NOW()');
  if (period === 'past') filters.push('e.ends_at < NOW()');
  if (options.requireTicket) filters.push('gt.id IS NOT NULL');
  if (options.requireCertificate) filters.push('c.id IS NOT NULL');

  const where = `WHERE ${filters.join(' AND ')}`;
  const rows = await query(`
    SELECT
      r.id,
      r.registration_number,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      r.created_at,
      r.updated_at,
      o.order_number,
      o.status AS order_status,
      d.full_name,
      d.email,
      d.mobile,
      d.specialty,
      e.id AS event_id,
      e.slug AS event_slug,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.summary_en AS event_summary_en,
      e.summary_ar AS event_summary_ar,
      e.description_en AS event_description_en,
      e.description_ar AS event_description_ar,
      e.type AS event_type,
      e.status AS event_status,
      e.starts_at,
      e.ends_at,
      e.timezone,
      e.cover_image_url,
      e.banner_image_url,
      e.gallery_json,
      e.google_maps_url,
      e.registration_ends_at,
      v.name_en AS venue_name_en,
      v.name_ar AS venue_name_ar,
      v.city_en,
      v.city_ar,
      v.address_en,
      v.address_ar,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      tt.description_en AS ticket_description_en,
      tt.description_ar AS ticket_description_ar,
      gt.id AS ticket_id,
      gt.ticket_number,
      gt.pdf_url AS ticket_pdf_url,
      a.qr_status,
      a.checked_in_at,
      c.id AS certificate_id,
      c.certificate_number,
      c.status AS certificate_status,
      c.file_url AS certificate_file_url,
      c.issued_at AS certificate_issued_at
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN venues v ON v.id = e.venue_id
    LEFT JOIN orders o ON o.id = r.order_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    ${where}
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT :limit OFFSET :offset
  `, params);
  const count = await first(`
    SELECT COUNT(*) AS total
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN orders o ON o.id = r.order_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    ${where}
  `, params);
  return { rows, total: Number(count?.total || 0), page: pageState.page, perPage };
}

router.use(requireAuth, requireRole('customer', 'doctor'));

router.get('/dashboard', asyncRoute(async (req, res) => {
  const recent = await customerRegistrations(req, { page: 1, perPage: 5, period: 'all' });
  const upcoming = await customerRegistrations(req, { page: 1, perPage: 1, period: 'upcoming', status: 'approved' });
  const pendingUpcoming = await customerRegistrations(req, {
    page: 1,
    perPage: 1,
    period: 'upcoming',
    registrationStatuses: ['pending_verification', 'pending_payment', 'pending_review', 'pending'],
  });
  const counts = await first(`
    SELECT
      COUNT(*) AS total_registrations,
      SUM(CASE WHEN e.starts_at >= NOW() AND r.registration_status IN ('approved','pending_payment','pending_verification','pending_review') THEN 1 ELSE 0 END) AS upcoming_registrations,
      SUM(CASE WHEN gt.id IS NOT NULL AND COALESCE(a.qr_status, 'active') = 'active' THEN 1 ELSE 0 END) AS active_tickets,
      SUM(CASE WHEN c.id IS NOT NULL AND c.status = 'issued' THEN 1 ELSE 0 END) AS available_certificates
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    WHERE ${userScopeSql('d')}
  `, baseParams(req));

  ok(res, {
    user: req.user,
    summary: {
      totalRegistrations: Number(counts?.total_registrations || 0),
      upcomingRegistrations: Number(counts?.upcoming_registrations || 0),
      activeTickets: Number(counts?.active_tickets || 0),
      availableCertificates: Number(counts?.available_certificates || 0),
      unreadNotifications: 0,
    },
    nextEvent: upcoming.rows[0] || null,
    pendingUpcomingRegistration: upcoming.rows[0] ? null : (pendingUpcoming.rows[0] || null),
    recentRegistrations: recent.rows,
    notifications: [],
  });
}));

router.get('/registrations', asyncRoute(async (req, res) => {
  const result = await customerRegistrations(req, req.query);
  ok(res, { data: result.rows, pagination: { total: result.total, page: result.page, perPage: result.perPage } });
}));

router.get('/registrations/:id', asyncRoute(async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return fail(res, 400, 'Invalid registration id');
  const row = await first(`
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
      r.updated_at,
      o.order_number,
      o.status AS order_status,
      d.full_name,
      d.email,
      d.mobile,
      d.city,
      d.specialty,
      d.nationality,
      e.id AS event_id,
      e.slug AS event_slug,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.summary_en AS event_summary_en,
      e.summary_ar AS event_summary_ar,
      e.description_en AS event_description_en,
      e.description_ar AS event_description_ar,
      e.type AS event_type,
      e.status AS event_status,
      e.starts_at,
      e.ends_at,
      e.timezone,
      e.cover_image_url,
      e.banner_image_url,
      e.gallery_json,
      e.google_maps_url,
      e.registration_ends_at,
      v.name_en AS venue_name_en,
      v.name_ar AS venue_name_ar,
      v.city_en,
      v.city_ar,
      v.address_en,
      v.address_ar,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      tt.description_en AS ticket_description_en,
      tt.description_ar AS ticket_description_ar,
      gt.id AS ticket_id,
      gt.ticket_number,
      gt.pdf_url AS ticket_pdf_url,
      a.qr_status,
      a.checked_in_at,
      c.certificate_number,
      c.status AS certificate_status,
      c.file_url AS certificate_file_url
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    LEFT JOIN venues v ON v.id = e.venue_id
    LEFT JOIN orders o ON o.id = r.order_id
    LEFT JOIN generated_tickets gt ON gt.registration_id = r.id
    LEFT JOIN attendees a ON a.id = gt.attendee_id
    LEFT JOIN certificates c ON c.attendee_id = a.id
    WHERE r.id = :id AND ${userScopeSql('d')}
    LIMIT 1
  `, baseParams(req, { id }));
  if (!row) return fail(res, 404, 'Registration not found');
  ok(res, row);
}));

router.get('/tickets', asyncRoute(async (req, res) => {
  const result = await customerRegistrations(req, { ...req.query, status: req.query.status || '', requireTicket: true });
  ok(res, { data: result.rows, pagination: { total: result.total, page: result.page, perPage: result.perPage } });
}));

router.get('/tickets/:id', asyncRoute(async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return fail(res, 400, 'Invalid ticket id');
  const row = await first(`
    SELECT
      gt.id,
      gt.ticket_number,
      gt.pdf_url,
      gt.generated_at,
      r.id AS registration_id,
      r.registration_number,
      r.registration_status,
      d.full_name,
      d.email,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.summary_en AS event_summary_en,
      e.summary_ar AS event_summary_ar,
      e.description_en AS event_description_en,
      e.description_ar AS event_description_ar,
      e.cover_image_url,
      e.banner_image_url,
      e.gallery_json,
      e.google_maps_url,
      e.starts_at,
      e.ends_at,
      v.name_en AS venue_name_en,
      v.name_ar AS venue_name_ar,
      v.city_en,
      v.city_ar,
      v.address_en,
      v.address_ar,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      a.qr_status,
      a.checked_in_at
    FROM generated_tickets gt
    JOIN registrations r ON r.id = gt.registration_id
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    LEFT JOIN venues v ON v.id = e.venue_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    JOIN attendees a ON a.id = gt.attendee_id
    WHERE gt.id = :id AND ${userScopeSql('d')}
    LIMIT 1
  `, baseParams(req, { id }));
  if (!row) return fail(res, 404, 'Ticket not found');
  ok(res, row);
}));

router.get('/tickets/:id/qr', asyncRoute(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const id = numericId(req.params.id);
  if (!id) return fail(res, 400, 'Invalid ticket id');

  const row = await first(`
    SELECT
      gt.id,
      gt.ticket_number,
      gt.qr_token,
      r.registration_number,
      r.registration_status,
      d.full_name,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.starts_at,
      e.ends_at,
      tt.name_en AS ticket_name_en,
      tt.name_ar AS ticket_name_ar,
      a.qr_status,
      a.checked_in_at
    FROM generated_tickets gt
    JOIN registrations r ON r.id = gt.registration_id
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    JOIN attendees a ON a.id = gt.attendee_id
    WHERE gt.id = :id AND ${userScopeSql('d')}
    LIMIT 1
  `, baseParams(req, { id }));

  if (!row) return fail(res, 404, 'Ticket not found');
  if (row.registration_status !== 'approved') {
    return fail(res, 409, 'QR code will be available once the registration is approved and the ticket is issued', { state: 'not_ready' });
  }
  if (row.qr_status === 'revoked') return fail(res, 409, 'Ticket QR is cancelled', { state: 'cancelled' });
  if (row.checked_in_at || row.qr_status === 'used') return fail(res, 409, 'Check-in completed', { state: 'checked_in', checkedInAt: row.checked_in_at });

  ok(res, {
    qrPayload: row.qr_token,
    ticketNumber: row.ticket_number,
    registrationNumber: row.registration_number,
    ticketStatus: row.checked_in_at || row.qr_status === 'used' ? 'checked_in' : 'ready',
    checkedInAt: row.checked_in_at,
    holderName: row.full_name,
    eventTitleEn: row.event_title_en,
    eventTitleAr: row.event_title_ar,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    ticketNameEn: row.ticket_name_en,
    ticketNameAr: row.ticket_name_ar,
  });
}));

router.get('/certificates', asyncRoute(async (req, res) => {
  const result = await customerRegistrations(req, { ...req.query, requireCertificate: true });
  ok(res, { data: result.rows, pagination: { total: result.total, page: result.page, perPage: result.perPage } });
}));

router.get('/notifications', asyncRoute(async (req, res) => {
  ok(res, { data: [], pagination: { total: 0, page: 1, perPage: 10 } });
}));

router.get('/reviews', asyncRoute(async (req, res) => {
  const rows = await query(`
    SELECT
      rv.id,
      rv.rating,
      rv.title,
      rv.comment,
      rv.status,
      rv.created_at,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar
    FROM reviews rv
    JOIN events e ON e.id = rv.event_id
    LEFT JOIN attendees a ON a.id = rv.attendee_id
    LEFT JOIN doctors d ON d.email = a.email
    WHERE rv.customer_id = :userId OR ${userScopeSql('d')}
    ORDER BY rv.created_at DESC, rv.id DESC
    LIMIT 50
  `, baseParams(req));
  ok(res, { data: rows, pagination: { total: rows.length, page: 1, perPage: 50 } });
}));

export default router;
