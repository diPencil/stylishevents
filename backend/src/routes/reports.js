import express from 'express';
import { query } from '../db/mysql.js';
import { asyncRoute, ok } from '../utils/apiResponse.js';

const router = express.Router();

function eventFilter(req) {
  const eventId = Number(req.query.eventId || 0);
  return {
    eventId,
    clause: eventId ? 'WHERE e.id = :eventId' : '',
  };
}

router.get('/summary', asyncRoute(async (req, res) => {
  const { eventId, clause } = eventFilter(req);

  const [registrations, payments, revenue, certificates] = await Promise.all([
    query(`
      SELECT
        r.registration_status AS status,
        COUNT(*) AS count
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      ${clause}
      GROUP BY r.registration_status
    `, { eventId }),
    query(`
      SELECT
        r.payment_status AS status,
        COUNT(*) AS count
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      ${clause}
      GROUP BY r.payment_status
    `, { eventId }),
    query(`
      SELECT
        o.currency,
        COALESCE(SUM(o.grand_total), 0) AS total,
        COUNT(*) AS paid_orders
      FROM orders o
      JOIN events e ON e.id = o.event_id
      ${clause ? `${clause} AND o.status = 'paid'` : "WHERE o.status = 'paid'"}
      GROUP BY o.currency
    `, { eventId }),
    query(`
      SELECT
        c.status,
        COUNT(*) AS count
      FROM certificates c
      JOIN attendees a ON a.id = c.attendee_id
      JOIN events e ON e.id = a.event_id
      ${clause}
      GROUP BY c.status
    `, { eventId }),
  ]);

  ok(res, { registrations, payments, revenue, certificates });
}));

router.get('/registrations', asyncRoute(async (req, res) => {
  const { eventId, clause } = eventFilter(req);
  const rows = await query(`
    SELECT
      r.registration_number,
      r.source,
      r.registration_status,
      r.payment_status,
      r.selected_currency,
      r.selected_price,
      r.created_at,
      r.event_id,
      d.full_name AS doctor_name,
      d.email AS doctor_email,
      d.mobile AS doctor_mobile,
      d.country_name,
      d.nationality,
      d.specialty,
      e.title_en AS event_title_en,
      tt.name_en AS ticket_name_en
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    JOIN ticket_types tt ON tt.id = r.ticket_type_id
    ${clause}
    ORDER BY r.created_at DESC
    LIMIT 1000
  `, { eventId });

  ok(res, rows);
}));

router.get('/nationalities', asyncRoute(async (req, res) => {
  const { eventId, clause } = eventFilter(req);
  const rows = await query(`
    SELECT
      d.nationality,
      d.country_name,
      COUNT(*) AS registrations
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    ${clause}
    GROUP BY d.nationality, d.country_name
    ORDER BY registrations DESC
  `, { eventId });

  ok(res, rows);
}));

router.get('/specialties', asyncRoute(async (req, res) => {
  const { eventId, clause } = eventFilter(req);
  const rows = await query(`
    SELECT
      d.specialty,
      COUNT(*) AS registrations
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    JOIN events e ON e.id = r.event_id
    ${clause}
    GROUP BY d.specialty
    ORDER BY registrations DESC
  `, { eventId });

  ok(res, rows);
}));

router.get('/ticket-performance', asyncRoute(async (req, res) => {
  const { eventId, clause } = eventFilter(req);
  const rows = await query(`
    SELECT
      e.title_en AS event_title_en,
      tt.name_en AS ticket_name_en,
      tt.quota,
      COUNT(r.id) AS registrations,
      SUM(CASE WHEN r.payment_status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN r.payment_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN r.payment_status = 'rejected' THEN 1 ELSE 0 END) AS rejected
    FROM ticket_types tt
    JOIN events e ON e.id = tt.event_id
    LEFT JOIN registrations r ON r.ticket_type_id = tt.id
    ${clause}
    GROUP BY e.id, tt.id
    ORDER BY registrations DESC
  `, { eventId });

  ok(res, rows);
}));

export default router;
