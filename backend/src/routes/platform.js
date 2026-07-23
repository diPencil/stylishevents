import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { first, query } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetUploadRoot = path.join(__dirname, '..', '..', 'uploads', 'assets');

function parseSetting(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function readProjectSetting(key, fallback = {}) {
  const setting = await first(
    'SELECT setting_value FROM project_settings WHERE setting_key = :key LIMIT 1',
    { key }
  );
  return parseSetting(setting?.setting_value, fallback);
}

async function writeProjectSetting(key, value) {
  await query(`
    INSERT INTO project_settings (setting_key, setting_value)
    VALUES (:key, :value)
    ON DUPLICATE KEY UPDATE setting_value = :value
  `, { key, value: JSON.stringify(value) });
}

async function savePlatformAsset({ fileName = 'asset', dataUrl = '' }) {
  const match = String(dataUrl).match(/^data:((?:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml))|(?:video\/(?:mp4|webm|ogg)));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    const error = new Error('Only png, jpg, webp, gif, svg, mp4, webm, and ogg assets are allowed');
    error.statusCode = 400;
    throw error;
  }

  const extensionByMime = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogg',
  };
  const extension = extensionByMime[match[1]];
  const buffer = Buffer.from(match[2], 'base64');
  const maxSize = String(match[1]).startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (buffer.length > maxSize) {
    const error = new Error(String(match[1]).startsWith('video/') ? 'Video must be 50MB or smaller' : 'Image must be 5MB or smaller');
    error.statusCode = 413;
    throw error;
  }

  await fs.mkdir(assetUploadRoot, { recursive: true });
  const safeBase = String(fileName)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'asset';
  const savedFileName = `${Date.now()}-${safeBase}.${extension}`;
  await fs.writeFile(path.join(assetUploadRoot, savedFileName), buffer);

  return `/uploads/assets/${savedFileName}`;
}

router.get('/overview', asyncRoute(async (req, res) => {
  const [
    eventsCount,
    publishedEvents,
    ordersCount,
    attendeesCount,
    checkedInCount,
    revenue,
    pendingReviews,
  ] = await Promise.all([
    first('SELECT COUNT(*) AS value FROM events'),
    first("SELECT COUNT(*) AS value FROM events WHERE status = 'published'"),
    first('SELECT COUNT(*) AS value FROM orders'),
    first('SELECT COUNT(*) AS value FROM attendees'),
    first('SELECT COUNT(*) AS value FROM attendees WHERE checked_in_at IS NOT NULL'),
    first("SELECT COALESCE(SUM(grand_total), 0) AS value FROM orders WHERE status = 'paid'"),
    first("SELECT COUNT(*) AS value FROM reviews WHERE status = 'pending'"),
  ]);

  const upcomingEvents = await query(`
    SELECT
      id,
      slug,
      title_en,
      title_ar,
      status,
      starts_at,
      ends_at,
      max_attendees
    FROM events
    WHERE starts_at >= NOW()
    ORDER BY starts_at ASC
    LIMIT 6
  `);

  ok(res, {
    stats: {
      events: Number(eventsCount.value),
      publishedEvents: Number(publishedEvents.value),
      orders: Number(ordersCount.value),
      attendees: Number(attendeesCount.value),
      checkedIn: Number(checkedInCount.value),
      revenue: Number(revenue.value),
      pendingReviews: Number(pendingReviews.value),
    },
    upcomingEvents,
  });
}));

router.get('/settings/theme', asyncRoute(async (req, res) => {
  ok(res, await readProjectSetting('theme', {}));
}));

router.put('/settings/theme', asyncRoute(async (req, res) => {
  const theme = {
    primaryColor: req.body.primaryColor || '#2563eb',
    secondaryColor: req.body.secondaryColor || '#0f172a',
    accentColor: req.body.accentColor || '#7c3aed',
    radius: String(req.body.radius || '12'),
    fontFamily: req.body.fontFamily || 'Rubik',
    buttonStyle: req.body.buttonStyle || 'solid',
    density: req.body.density || 'comfortable',
    logoEnUrl: req.body.logoEnUrl || '/stylish-logo.svg',
    logoArUrl: req.body.logoArUrl || '/stylish-logo-ar.svg',
    faviconUrl: req.body.faviconUrl || '/stylish-favicon.svg',
  };

  await writeProjectSetting('theme', theme);

  ok(res, theme, 'Theme settings saved');
}));

router.get('/settings/site-content', asyncRoute(async (req, res) => {
  ok(res, await readProjectSetting('site_content', {}));
}));

// Validation schema for event page settings (no manual ordering)
const eventPageSchema = z.object({
  enabled: z.boolean().optional(),
  eyebrowEn: z.string().max(300).optional(),
  eyebrowAr: z.string().max(300).optional(),
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  emptyTitleEn: z.string().max(300).optional(),
  emptyTitleAr: z.string().max(300).optional(),
  emptyDescriptionEn: z.string().max(1000).optional(),
  emptyDescriptionAr: z.string().max(1000).optional(),
  sortMode: z.enum(['default', 'nearest', 'latest', 'oldest']).optional(),
});

// Informational section nested schema
const infoBulletSchema = z.object({
  id: z.string().min(1),
  textEn: z.string().max(500),
  textAr: z.string().max(500),
});

const informationSectionSchema = z.object({
  enabled: z.boolean().optional(),
  badgeEn: z.string().max(300).optional(),
  badgeAr: z.string().max(300).optional(),
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  imageUrl: z.string().max(2000).optional(),
  imageAltEn: z.string().max(300).optional(),
  imageAltAr: z.string().max(300).optional(),
  imagePosition: z.enum(['left','right']).optional(),
  bullets: z.array(infoBulletSchema).max(6).optional(),
}).partial();

router.put('/settings/site-content', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const incoming = req.body || {};
  const current = await readProjectSetting('site_content', {});

  const updated = { ...current };

  // Validate and merge upcomingEvents
  if (incoming.upcomingEvents !== undefined) {
    const parsed = eventPageSchema.safeParse(incoming.upcomingEvents);
    if (!parsed.success) return fail(res, 400, 'Invalid upcomingEvents', parsed.error.flatten());
    // Start with a shallow merge of known page fields
    const merged = { ...(current.upcomingEvents || {}), ...parsed.data };

    // If informationSection is being updated, validate and merge deeply
    if (incoming.upcomingEvents.informationSection !== undefined) {
      const infoParsed = informationSectionSchema.safeParse(incoming.upcomingEvents.informationSection);
      if (!infoParsed.success) return fail(res, 400, 'Invalid upcomingEvents.informationSection', infoParsed.error.flatten());
      merged.informationSection = { ...(current.upcomingEvents?.informationSection || {}), ...infoParsed.data };
      // trim nested strings
      for (const k of Object.keys(merged.informationSection || {})) {
        const v = merged.informationSection[k];
        if (typeof v === 'string') merged.informationSection[k] = v.trim();
      }
    }

    // trim top-level strings
    for (const k of Object.keys(merged || {})) {
      const v = merged[k];
      if (typeof v === 'string') merged[k] = v.trim();
    }

    updated.upcomingEvents = merged;
  }

  // Validate and merge previousEvents
  if (incoming.previousEvents !== undefined) {
    const parsed = eventPageSchema.safeParse(incoming.previousEvents);
    if (!parsed.success) return fail(res, 400, 'Invalid previousEvents', parsed.error.flatten());
    const merged = { ...(current.previousEvents || {}), ...parsed.data };

    if (incoming.previousEvents.informationSection !== undefined) {
      const infoParsed = informationSectionSchema.safeParse(incoming.previousEvents.informationSection);
      if (!infoParsed.success) return fail(res, 400, 'Invalid previousEvents.informationSection', infoParsed.error.flatten());
      merged.informationSection = { ...(current.previousEvents?.informationSection || {}), ...infoParsed.data };
      for (const k of Object.keys(merged.informationSection || {})) {
        const v = merged.informationSection[k];
        if (typeof v === 'string') merged.informationSection[k] = v.trim();
      }
    }

    for (const k of Object.keys(merged || {})) {
      const v = merged[k];
      if (typeof v === 'string') merged[k] = v.trim();
    }

    updated.previousEvents = merged;
  }

  // For all other top-level settings, preserve or merge shallowly if provided
  const allowedToplevel = ['homepage', 'menu', 'faqs', 'whyUsCards', 'footerLinks', 'socialLinks', 'seo'];
  for (const key of allowedToplevel) {
    if (incoming[key] !== undefined) updated[key] = incoming[key];
  }

  await writeProjectSetting('site_content', updated);
  ok(res, updated, 'Website settings saved');
}));

router.get('/settings/currency', asyncRoute(async (req, res) => {
  ok(res, await readProjectSetting('currency', {}));
}));

router.put('/settings/currency', asyncRoute(async (req, res) => {
  await writeProjectSetting('currency', req.body || {});
  ok(res, req.body || {}, 'Currency settings saved');
}));

router.post('/assets/upload', asyncRoute(async (req, res) => {
  try {
    const url = await savePlatformAsset(req.body || {});
    ok(res, { url }, 'Image uploaded');
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Image upload failed');
  }
}));

export default router;
