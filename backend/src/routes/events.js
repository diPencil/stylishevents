import express from 'express';
import { z } from 'zod';
import { first, query, transaction } from '../db/mysql.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { eventScopeCondition, requireEventScope } from '../auth/scope.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const eventStatus = ['draft', 'published', 'sold_out', 'completed', 'cancelled', 'disabled', 'deleted'];

const eventSchema = z.object({
  slug: z.string().min(2),
  titleEn: z.string().min(2),
  titleAr: z.string().min(2),
  summaryEn: z.string().optional().nullable(),
  summaryAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  type: z.enum(['conference', 'exhibition', 'workshop', 'festival', 'webinar', 'other']).default('conference'),
  status: z.enum(eventStatus).default('draft'),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  registrationStartsAt: z.string().optional().nullable(),
  registrationEndsAt: z.string().optional().nullable(),
  publicRegistrationEnabled: z.boolean().default(true),
  registrationApprovalMode: z.enum(['automatic', 'manual_review']).default('automatic'),
  registrationAccess: z.enum(['guest_allowed', 'login_required']).default('guest_allowed'),
  maxTicketsPerCheckout: z.number().int().positive().max(1).default(1),
  capacityHoldHoursOverride: z.number().int().positive().max(720).optional().nullable(),
  manualPaymentEnabled: z.boolean().default(true),
  timezone: z.string().default('Africa/Cairo'),
  maxAttendees: z.number().int().positive().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  bannerImageUrl: z.string().optional().nullable(),
  eventDetailsImageUrl: z.string().optional().nullable(),
  gallery: z.array(z.string()).default([]),
  googleMapsUrl: z.string().optional().nullable(),
  venueId: z.number().int().positive().optional().nullable(),
  organizerId: z.number().int().positive().optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(eventStatus),
});

function eventSelect() {
  return `
    SELECT
      e.id,
      e.organizer_id,
      e.venue_id,
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
      e.event_details_image_url,
      e.gallery_json,
      e.google_maps_url,
      e.max_attendees,
      e.created_at,
      e.updated_at,
      v.name_en AS venue_name_en,
      v.name_ar AS venue_name_ar,
      v.city_en AS venue_city_en,
      v.city_ar AS venue_city_ar,
      v.capacity AS venue_capacity,
      u.name AS organizer_name,
      COUNT(DISTINCT tt.id) AS ticket_types_count,
      COUNT(DISTINCT a.id) AS attendees_count,
      COUNT(DISTINCT r.id) AS registrations_count,
      COALESCE(AVG(rv.rating), 0) AS average_rating
    FROM events e
    LEFT JOIN venues v ON v.id = e.venue_id
    LEFT JOIN users u ON u.id = e.organizer_id
    LEFT JOIN ticket_types tt ON tt.event_id = e.id
    LEFT JOIN attendees a ON a.event_id = e.id
    LEFT JOIN registrations r ON r.event_id = e.id
    LEFT JOIN reviews rv ON rv.event_id = e.id AND rv.status = 'approved'
  `;
}

function eventParams(event) {
  return {
    slug: event.slug,
    titleEn: event.titleEn,
    titleAr: event.titleAr,
    summaryEn: event.summaryEn || null,
    summaryAr: event.summaryAr || null,
    descriptionEn: event.descriptionEn || null,
    descriptionAr: event.descriptionAr || null,
    type: event.type,
    status: event.status,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    registrationStartsAt: event.registrationStartsAt || null,
    registrationEndsAt: event.registrationEndsAt || null,
    publicRegistrationEnabled: event.publicRegistrationEnabled ? 1 : 0,
    registrationApprovalMode: event.registrationApprovalMode || 'automatic',
    registrationAccess: event.registrationAccess || 'guest_allowed',
    maxTicketsPerCheckout: Math.max(1, Math.min(Number(event.maxTicketsPerCheckout || 1), 1)),
    capacityHoldHoursOverride: event.capacityHoldHoursOverride || null,
    manualPaymentEnabled: event.manualPaymentEnabled ? 1 : 0,
    timezone: event.timezone,
    maxAttendees: event.maxAttendees || null,
    coverImageUrl: event.coverImageUrl || null,
    bannerImageUrl: event.bannerImageUrl || null,
    eventDetailsImageUrl: event.eventDetailsImageUrl || null,
    gallery: JSON.stringify(event.gallery || []),
    googleMapsUrl: event.googleMapsUrl || null,
    venueId: event.venueId || null,
    organizerId: event.organizerId || null,
  };
}

router.get('/', asyncRoute(async (req, res) => {
  const status = String(req.query.status || '').trim();
  const includeDeleted = String(req.query.includeDeleted || '') === 'true';
  const page = String(req.query.page || '').trim(); // 'upcoming' | 'previous'
  const sortMode = String(req.query.sortMode || 'default').trim();
  const limit = Math.max(1, Math.min(Number(req.query.limit || 250), 500));

  const allowedSorts = ['default', 'nearest', 'latest', 'oldest'];
  if (sortMode && !allowedSorts.includes(sortMode)) return fail(res, 400, 'Invalid sortMode', { allowed: allowedSorts })

  // Validate page if provided
  const allowedPages = ['upcoming', 'previous'];
  if (page && !allowedPages.includes(page)) return fail(res, 400, 'Invalid page', { allowed: allowedPages })

  const canManageEvents = req.user?.permissions?.includes('events.manage');
  let where = canManageEvents
    ? `WHERE (:status = '' OR e.status = :status) AND (:includeDeleted = 1 OR e.status <> 'deleted')`
    : `WHERE e.status = 'published' AND e.status <> 'deleted'`;
  let params = { status, includeDeleted: includeDeleted ? 1 : 0, limit };

  if (canManageEvents) {
    const scope = eventScopeCondition(req.user, 'e');
    where += ` AND (${scope.clause})`;
    params = { ...params, ...scope.params };
  }

  if (page === 'upcoming') {
    // Only published and not ended
    where = `WHERE e.status = 'published' AND ((e.ends_at IS NOT NULL AND e.ends_at >= NOW()) OR (e.ends_at IS NULL AND e.starts_at >= NOW()))`;
    if (canManageEvents) {
      const scope = eventScopeCondition(req.user, 'e');
      where += ` AND (${scope.clause})`;
      params = { ...params, ...scope.params };
    }
  } else if (page === 'previous') {
    // Only published and already ended
    where = `WHERE e.status = 'published' AND ((e.ends_at IS NOT NULL AND e.ends_at < NOW()) OR (e.ends_at IS NULL AND e.starts_at < NOW()))`;
    if (canManageEvents) {
      const scope = eventScopeCondition(req.user, 'e');
      where += ` AND (${scope.clause})`;
      params = { ...params, ...scope.params };
    }
  }

  // Map sort modes to safe ORDER BY clauses
  let orderBy = 'e.starts_at DESC';
  if (sortMode === 'nearest') {
    if (page === 'previous') orderBy = 'COALESCE(e.ends_at, e.starts_at, e.created_at) DESC';
    else orderBy = 'COALESCE(e.starts_at, e.created_at) ASC';
  } else if (sortMode === 'latest') {
    orderBy = 'e.created_at DESC';
  } else if (sortMode === 'oldest') {
    orderBy = 'COALESCE(e.starts_at, e.created_at) ASC';
  }

  const rows = await query(`
    ${eventSelect()}
    ${where}
    GROUP BY e.id
    ORDER BY ${orderBy}
    LIMIT :limit
  `, params);

  ok(res, rows);
}));

router.get('/:id', asyncRoute(async (req, res) => {
  const event = await first(`
    ${eventSelect()}
    WHERE e.id = :id
    GROUP BY e.id
  `, { id: Number(req.params.id) });

  if (!event) return fail(res, 404, 'Event not found');
  const canManageEvents = req.user?.permissions?.includes('events.manage');
  if (event.status !== 'published' && !canManageEvents) return fail(res, 404, 'Event not found');
  if (canManageEvents && !(await requireEventScope(req, res, event.id))) return;

  const [sessions, tickets, templates] = await Promise.all([
    query(`
      SELECT id, title_en, title_ar, speaker_name, starts_at, ends_at, room_name
      FROM event_sessions
      WHERE event_id = :id
      ORDER BY starts_at ASC
    `, { id: event.id }),
    query(`
      SELECT
        tt.id,
        tt.name_en,
        tt.name_ar,
        tt.description_en,
        tt.description_ar,
        tt.quota,
        tt.per_order_limit,
        tt.is_active,
        COUNT(a.id) AS sold_count
      FROM ticket_types tt
      LEFT JOIN attendees a ON a.ticket_type_id = tt.id
      WHERE tt.event_id = :id
      GROUP BY tt.id
      ORDER BY tt.created_at ASC
    `, { id: event.id }),
    query(`
      SELECT id, name, template_type, template_url, field_positions_json, is_default, is_active
      FROM certificate_templates
      WHERE event_id = :id
      ORDER BY is_default DESC, updated_at DESC
    `, { id: event.id }),
  ]);

  ok(res, { event, sessions, tickets, certificateTemplates: templates });
}));

router.post('/', requireAuth, requirePermission('events.manage'), asyncRoute(async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const event = eventParams(parsed.data);
  if (req.user.role_code === 'organizer') event.organizerId = req.user.id;
  const result = await query(`
    INSERT INTO events (
      organizer_id,
      venue_id,
      slug,
      title_en,
      title_ar,
      summary_en,
      summary_ar,
      description_en,
      description_ar,
      type,
      status,
      starts_at,
      ends_at,
      registration_starts_at,
      registration_ends_at,
      public_registration_enabled,
      registration_approval_mode,
      registration_access,
      max_tickets_per_checkout,
      capacity_hold_hours_override,
      manual_payment_enabled,
      timezone,
      cover_image_url,
      banner_image_url,
      event_details_image_url,
      gallery_json,
      google_maps_url,
      max_attendees
    )
    VALUES (
      :organizerId,
      :venueId,
      :slug,
      :titleEn,
      :titleAr,
      :summaryEn,
      :summaryAr,
      :descriptionEn,
      :descriptionAr,
      :type,
      :status,
      :startsAt,
      :endsAt,
      :registrationStartsAt,
      :registrationEndsAt,
      :publicRegistrationEnabled,
      :registrationApprovalMode,
      :registrationAccess,
      :maxTicketsPerCheckout,
      :capacityHoldHoursOverride,
      :manualPaymentEnabled,
      :timezone,
      :coverImageUrl,
      :bannerImageUrl,
      :eventDetailsImageUrl,
      :gallery,
      :googleMapsUrl,
      :maxAttendees
    )
  `, event);

  ok(res, { id: result.insertId, ...parsed.data }, 'Event created');
}));

router.put('/:id', requireAuth, requirePermission('events.manage'), asyncRoute(async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const id = Number(req.params.id);
  const existing = await first('SELECT id FROM events WHERE id = :id', { id });
  if (!existing) return fail(res, 404, 'Event not found');
  if (!(await requireEventScope(req, res, id))) return;

  const event = eventParams(parsed.data);
  if (req.user.role_code === 'organizer') event.organizerId = req.user.id;
  await query(`
    UPDATE events
    SET
      organizer_id = :organizerId,
      venue_id = :venueId,
      slug = :slug,
      title_en = :titleEn,
      title_ar = :titleAr,
      summary_en = :summaryEn,
      summary_ar = :summaryAr,
      description_en = :descriptionEn,
      description_ar = :descriptionAr,
      type = :type,
      status = :status,
      starts_at = :startsAt,
      ends_at = :endsAt,
      registration_starts_at = :registrationStartsAt,
      registration_ends_at = :registrationEndsAt,
      public_registration_enabled = :publicRegistrationEnabled,
      registration_approval_mode = :registrationApprovalMode,
      registration_access = :registrationAccess,
      max_tickets_per_checkout = :maxTicketsPerCheckout,
      capacity_hold_hours_override = :capacityHoldHoursOverride,
      manual_payment_enabled = :manualPaymentEnabled,
      timezone = :timezone,
      cover_image_url = :coverImageUrl,
      banner_image_url = :bannerImageUrl,
      event_details_image_url = :eventDetailsImageUrl,
      gallery_json = :gallery,
      google_maps_url = :googleMapsUrl,
      max_attendees = :maxAttendees
    WHERE id = :id
  `, { id, ...event });

  ok(res, { id, ...parsed.data }, 'Event updated');
}));

router.patch('/:id/status', requireAuth, requirePermission('events.manage'), asyncRoute(async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  if (!(await requireEventScope(req, res, Number(req.params.id)))) return;
  await query('UPDATE events SET status = :status WHERE id = :id', {
    id: Number(req.params.id),
    status: parsed.data.status,
  });

  ok(res, { id: Number(req.params.id), status: parsed.data.status }, 'Event status updated');
}));

router.delete('/:id', requireAuth, requirePermission('events.manage'), asyncRoute(async (req, res) => {
  if (!(await requireEventScope(req, res, Number(req.params.id)))) return;
  await query("UPDATE events SET status = 'deleted' WHERE id = :id", { id: Number(req.params.id) });
  ok(res, { id: Number(req.params.id), status: 'deleted' }, 'Event moved to deleted');
}));

router.post('/:id/restore', requireAuth, requirePermission('events.manage'), asyncRoute(async (req, res) => {
  if (!(await requireEventScope(req, res, Number(req.params.id)))) return;
  await query("UPDATE events SET status = 'draft' WHERE id = :id AND status = 'deleted'", { id: Number(req.params.id) });
  ok(res, { id: Number(req.params.id), status: 'draft' }, 'Event restored to draft');
}));

export default router;
