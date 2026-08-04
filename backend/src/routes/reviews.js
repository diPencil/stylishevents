import express from 'express';
import { first, query } from '../db/mysql.js';
import { requireAuth, requireAnyPermission, requirePermission } from '../middleware/auth.js';
import { eventScopeCondition, requireEventScope } from '../auth/scope.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

router.get('/', requireAuth, requireAnyPermission(['reviews.view', 'reviews.manage']), asyncRoute(async (req, res) => {
  const eventId = Number(req.query.eventId || 0);
  if (eventId && !(await requireEventScope(req, res, eventId))) return;
  const scope = eventScopeCondition(req.user, 'e');
  const rows = await query(`
    SELECT
      r.id,
      r.rating,
      r.title,
      r.comment,
      r.status,
      r.created_at,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      a.full_name AS attendee_name,
      a.email AS attendee_email,
      u.name AS customer_name,
      u.email AS customer_email
    FROM reviews r
    JOIN events e ON e.id = r.event_id
    LEFT JOIN attendees a ON a.id = r.attendee_id
    LEFT JOIN users u ON u.id = r.customer_id
    WHERE (:eventId = 0 OR r.event_id = :eventId)
      AND (${scope.clause})
    ORDER BY r.created_at DESC
    LIMIT 150
  `, { eventId, ...scope.params });

  ok(res, rows);
}));

router.get('/:id', requireAuth, requireAnyPermission(['reviews.view', 'reviews.manage']), asyncRoute(async (req, res) => {
  const row = await first(`
    SELECT
      r.id,
      r.rating,
      r.title,
      r.comment,
      r.status,
      r.created_at,
      e.id AS event_id,
      e.title_en AS event_title_en,
      e.title_ar AS event_title_ar,
      e.slug AS event_slug,
      e.starts_at AS event_starts_at,
      e.ends_at AS event_ends_at,
      a.id AS attendee_id,
      a.full_name AS attendee_name,
      a.email AS attendee_email,
      a.phone AS attendee_phone,
      a.checked_in_at,
      u.id AS customer_id,
      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      u.country_name,
      u.country_code,
      u.gender
    FROM reviews r
    JOIN events e ON e.id = r.event_id
    LEFT JOIN attendees a ON a.id = r.attendee_id
    LEFT JOIN users u ON u.id = r.customer_id
    WHERE r.id = :id
    LIMIT 1
  `, { id: Number(req.params.id) });

  if (!row) return fail(res, 404, 'Review not found');
  if (!(await requireEventScope(req, res, row.event_id))) return;
  ok(res, row);
}));

router.patch('/:id/status', requireAuth, requirePermission('reviews.manage'), asyncRoute(async (req, res) => {
  const statusMap = {
    pending: 'pending',
    published: 'approved',
    approved: 'approved',
    rejected: 'rejected',
  };
  const status = statusMap[req.body.status];
  if (!status) return fail(res, 400, 'Invalid review status');
  const review = await first('SELECT id, event_id FROM reviews WHERE id = :id LIMIT 1', { id: Number(req.params.id) });
  if (!review) return fail(res, 404, 'Review not found');
  if (!(await requireEventScope(req, res, review.event_id))) return;

  await query('UPDATE reviews SET status = :status WHERE id = :id', {
    id: Number(req.params.id),
    status,
  });

  ok(res, { id: Number(req.params.id), status }, 'Review status updated');
}));

router.delete('/:id', requireAuth, requirePermission('reviews.manage'), asyncRoute(async (req, res) => {
  const review = await first('SELECT id, event_id FROM reviews WHERE id = :id LIMIT 1', { id: Number(req.params.id) });
  if (!review) return fail(res, 404, 'Review not found');
  if (!(await requireEventScope(req, res, review.event_id))) return;
  await query('DELETE FROM reviews WHERE id = :id', { id: Number(req.params.id) });
  ok(res, { id: Number(req.params.id) }, 'Review deleted');
}));

export default router;
