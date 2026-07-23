import express from 'express';
import { z } from 'zod';
import { query, transaction } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';

const router = express.Router();

const ticketTypeSchema = z.object({
  eventId: z.number().int().positive(),
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  quota: z.number().int().positive().optional().nullable(),
  perOrderLimit: z.number().int().positive().default(10),
  isActive: z.boolean().default(true),
});

const pricePeriodSchema = z.object({
  ticketTypeId: z.number().int().positive(),
  labelEn: z.string().min(2),
  labelAr: z.string().min(2),
  price: z.number().nonnegative().optional(),
  priceEgp: z.number().nonnegative().optional(),
  priceUsd: z.number().nonnegative().optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  isActive: z.boolean().default(true),
});

function normalizeTicket(ticket) {
  return {
    ...ticket,
    descriptionEn: ticket.descriptionEn || null,
    descriptionAr: ticket.descriptionAr || null,
    quota: ticket.quota || null,
    perOrderLimit: ticket.perOrderLimit || 10,
    isActive: ticket.isActive ?? true,
  };
}

function normalizePeriod(period) {
  const fallback = period.price ?? 0;
  return {
    ...period,
    price: period.price ?? period.priceUsd ?? period.priceEgp ?? 0,
    priceEgp: period.priceEgp ?? fallback,
    priceUsd: period.priceUsd ?? fallback,
  };
}

router.get('/', asyncRoute(async (req, res) => {
  const eventId = Number(req.query.eventId || 0);

  const rows = await query(`
    SELECT
      tt.id,
      tt.event_id,
      tt.name_en,
      tt.name_ar,
      tt.quota,
      tt.per_order_limit,
      tt.is_active,
      COUNT(DISTINCT a.id) AS sold_count,
      MIN(CASE WHEN tpp.is_active = 1 THEN tpp.price_egp END) AS min_price_egp,
      MAX(CASE WHEN tpp.is_active = 1 THEN tpp.price_egp END) AS max_price_egp,
      MIN(CASE WHEN tpp.is_active = 1 THEN tpp.price_usd END) AS min_price_usd,
      MAX(CASE WHEN tpp.is_active = 1 THEN tpp.price_usd END) AS max_price_usd
    FROM ticket_types tt
    LEFT JOIN attendees a ON a.ticket_type_id = tt.id
    LEFT JOIN ticket_price_periods tpp ON tpp.ticket_type_id = tt.id
    ${eventId ? 'WHERE tt.event_id = :eventId' : ''}
    GROUP BY tt.id
    ORDER BY tt.created_at DESC
  `, { eventId });

  ok(res, rows);
}));

router.post('/', asyncRoute(async (req, res) => {
  const parsed = ticketTypeSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const ticket = normalizeTicket(parsed.data);
  const result = await query(`
    INSERT INTO ticket_types (
      event_id,
      name_en,
      name_ar,
      description_en,
      description_ar,
      quota,
      per_order_limit,
      is_active
    )
    VALUES (
      :eventId,
      :nameEn,
      :nameAr,
      :descriptionEn,
      :descriptionAr,
      :quota,
      :perOrderLimit,
      :isActive
    )
  `, ticket);

  ok(res, { id: result.insertId, ...ticket }, 'Ticket type created');
}));

router.put('/:id', asyncRoute(async (req, res) => {
  const parsed = ticketTypeSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const ticket = normalizeTicket(parsed.data);
  await query(`
    UPDATE ticket_types
    SET
      event_id = :eventId,
      name_en = :nameEn,
      name_ar = :nameAr,
      description_en = :descriptionEn,
      description_ar = :descriptionAr,
      quota = :quota,
      per_order_limit = :perOrderLimit,
      is_active = :isActive
    WHERE id = :id
  `, { id: Number(req.params.id), ...ticket });

  ok(res, { id: Number(req.params.id), ...ticket }, 'Ticket type updated');
}));

router.patch('/:id/status', asyncRoute(async (req, res) => {
  const isActive = Boolean(req.body.isActive);
  await query('UPDATE ticket_types SET is_active = :isActive WHERE id = :id', {
    id: Number(req.params.id),
    isActive,
  });

  ok(res, { id: Number(req.params.id), isActive }, 'Ticket type status updated');
}));

router.delete('/:id', asyncRoute(async (req, res) => {
  await query('UPDATE ticket_types SET is_active = 0 WHERE id = :id', { id: Number(req.params.id) });
  ok(res, { id: Number(req.params.id), isActive: false }, 'Ticket type disabled');
}));

router.get('/:ticketTypeId/price-periods', asyncRoute(async (req, res) => {
  const rows = await query(`
    SELECT
      id,
      ticket_type_id,
      label_en,
      label_ar,
      price,
      price_egp,
      price_usd,
      starts_at,
      ends_at,
      is_active
    FROM ticket_price_periods
    WHERE ticket_type_id = :ticketTypeId
    ORDER BY starts_at ASC
  `, { ticketTypeId: Number(req.params.ticketTypeId) });

  ok(res, rows);
}));

router.post('/price-periods', asyncRoute(async (req, res) => {
  const parsed = pricePeriodSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const period = normalizePeriod(parsed.data);
  const price = period.price;
  const result = await transaction(async (connection) => {
    const [insertResult] = await connection.execute(`
      INSERT INTO ticket_price_periods (
        ticket_type_id,
        label_en,
        label_ar,
        price,
        price_egp,
        price_usd,
        starts_at,
        ends_at,
        is_active
      )
      VALUES (
        :ticketTypeId,
        :labelEn,
        :labelAr,
        :price,
        :priceEgp,
        :priceUsd,
        :startsAt,
        :endsAt,
        :isActive
      )
    `, { ...period, price });

    return insertResult;
  });

  ok(res, { id: result.insertId, ...period }, 'Price period created');
}));

router.put('/price-periods/:id', asyncRoute(async (req, res) => {
  const parsed = pricePeriodSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const period = normalizePeriod(parsed.data);
  const price = period.price;
  await query(`
    UPDATE ticket_price_periods
    SET
      ticket_type_id = :ticketTypeId,
      label_en = :labelEn,
      label_ar = :labelAr,
      price = :price,
      price_egp = :priceEgp,
      price_usd = :priceUsd,
      starts_at = :startsAt,
      ends_at = :endsAt,
      is_active = :isActive
    WHERE id = :id
  `, { id: Number(req.params.id), ...period, price });

  ok(res, { id: Number(req.params.id), ...period }, 'Price period updated');
}));

router.patch('/price-periods/:id/status', asyncRoute(async (req, res) => {
  const isActive = Boolean(req.body.isActive);
  await query('UPDATE ticket_price_periods SET is_active = :isActive WHERE id = :id', {
    id: Number(req.params.id),
    isActive,
  });

  ok(res, { id: Number(req.params.id), isActive }, 'Price period status updated');
}));

router.delete('/price-periods/:id', asyncRoute(async (req, res) => {
  await query('UPDATE ticket_price_periods SET is_active = 0 WHERE id = :id', { id: Number(req.params.id) });
  ok(res, { id: Number(req.params.id), isActive: false }, 'Price period disabled');
}));

export default router;
