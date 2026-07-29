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

const safeUrlString = z.string().max(2000).refine((value) => {
  if (!value) return true;
  if (/^https?:\/\//i.test(value)) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  return value.startsWith('/') && !value.startsWith('//');
}, 'Invalid URL');

const timelineItemSchema = z.object({
  id: z.string().min(1).max(120),
  labelEn: z.string().max(40).optional(),
  labelAr: z.string().max(40).optional(),
  titleEn: z.string().max(160).optional(),
  titleAr: z.string().max(160).optional(),
  descriptionEn: z.string().max(500).optional(),
  descriptionAr: z.string().max(500).optional(),
});

const galleryImageSchema = z.object({
  id: z.string().min(1).max(120),
  imageUrl: safeUrlString.optional(),
  altEn: z.string().max(300).optional(),
  altAr: z.string().max(300).optional(),
  focalPosition: z.enum(['center', 'top', 'bottom', 'left', 'right']).optional(),
});

const inspireSectionSchema = z.object({
  enabled: z.boolean().optional(),
  eyebrowEn: z.string().max(160).optional(),
  eyebrowAr: z.string().max(160).optional(),
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  showAccentLine: z.boolean().optional(),
  anchorId: z.string().max(120).regex(/^[A-Za-z0-9_-]*$/).optional(),
  timeline: z.object({
    enabled: z.boolean().optional(),
    items: z.array(timelineItemSchema).max(6).optional(),
  }).optional(),
  cta: z.object({
    enabled: z.boolean().optional(),
    labelEn: z.string().max(120).optional(),
    labelAr: z.string().max(120).optional(),
    url: safeUrlString.optional(),
    linkType: z.enum(['internal', 'external']).optional(),
    openInNewTab: z.boolean().optional(),
  }).superRefine((cta, ctx) => {
    if (!cta.url) return;
    if (cta.linkType === 'external' && !/^https?:\/\//i.test(cta.url)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['url'], message: 'External CTA URL must start with http:// or https://' });
    }
    if ((cta.linkType === 'internal' || !cta.linkType) && /^https?:\/\//i.test(cta.url)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['url'], message: 'Internal CTA URL must be a relative path' });
    }
  }).optional(),
  gallery: z.array(galleryImageSchema).max(4).optional(),
}).partial();

const homepageSchema = z.object({
  eventsInspireSection: inspireSectionSchema.optional(),
}).passthrough();

const contactCardSchema = z.object({
  id: z.string().min(1).max(120),
  enabled: z.boolean().optional(),
  icon: z.enum(['phone', 'mail', 'mapPin', 'headphones']).optional(),
  labelEn: z.string().max(120).optional(),
  labelAr: z.string().max(120).optional(),
  value: z.string().max(300).optional(),
  supportingTextEn: z.string().max(500).optional(),
  supportingTextAr: z.string().max(500).optional(),
  linkType: z.enum(['phone', 'email', 'internal', 'external', 'map', 'whatsapp']).optional(),
  linkValue: z.string().max(1000).optional(),
}).superRefine((card, ctx) => {
  if (!card.linkValue) return;
  if (['external', 'map'].includes(card.linkType) && !/^https?:\/\//i.test(card.linkValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['linkValue'], message: 'External and map links must start with http:// or https://' });
  }
  if (card.linkType === 'internal' && (!card.linkValue.startsWith('/') || card.linkValue.startsWith('//'))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['linkValue'], message: 'Internal links must be relative paths' });
  }
  if (card.linkType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(card.linkValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['linkValue'], message: 'Email links must contain a valid email address' });
  }
  if (card.linkType === 'phone' && !/^\+?[0-9\s().-]{7,30}$/.test(card.linkValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['linkValue'], message: 'Phone links must contain a valid phone number' });
  }
  if (card.linkType === 'whatsapp' && !/^\+?[0-9\s().-]{7,30}$/.test(card.linkValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['linkValue'], message: 'WhatsApp links must contain a valid phone number' });
  }
});

const benefitCardSchema = z.object({
  id: z.string().min(1).max(120),
  icon: z.enum(['message', 'userCheck', 'calendar', 'lifeBuoy']).optional(),
  titleEn: z.string().max(160).optional(),
  titleAr: z.string().max(160).optional(),
  textEn: z.string().max(600).optional(),
  textAr: z.string().max(600).optional(),
});

const contactPageSchema = z.object({
  hero: z.object({
    enabled: z.boolean().optional(),
    eyebrowEn: z.string().max(160).optional(),
    eyebrowAr: z.string().max(160).optional(),
    titleEn: z.string().max(300).optional(),
    titleAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(2000).optional(),
    descriptionAr: z.string().max(2000).optional(),
    supportingTextEn: z.string().max(1000).optional(),
    supportingTextAr: z.string().max(1000).optional(),
    imageUrl: safeUrlString.optional(),
    imageAltEn: z.string().max(300).optional(),
    imageAltAr: z.string().max(300).optional(),
    primaryCtaEn: z.string().max(120).optional(),
    primaryCtaAr: z.string().max(120).optional(),
    secondaryCtaEn: z.string().max(120).optional(),
    secondaryCtaAr: z.string().max(120).optional(),
  }).optional(),
  contactCards: z.array(contactCardSchema).max(4).optional(),
  requestSection: z.object({
    enabled: z.boolean().optional(),
    eyebrowEn: z.string().max(160).optional(),
    eyebrowAr: z.string().max(160).optional(),
    titleEn: z.string().max(300).optional(),
    titleAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(2000).optional(),
    descriptionAr: z.string().max(2000).optional(),
    supportingTextEn: z.string().max(1000).optional(),
    supportingTextAr: z.string().max(1000).optional(),
    benefits: z.array(benefitCardSchema).max(4).optional(),
    stepsEn: z.array(z.string().max(80)).length(3).optional(),
    stepsAr: z.array(z.string().max(80)).length(3).optional(),
    submitLabelEn: z.string().max(120).optional(),
    submitLabelAr: z.string().max(120).optional(),
  }).optional(),
  successState: z.object({
    titleEn: z.string().max(300).optional(),
    titleAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(1000).optional(),
    descriptionAr: z.string().max(1000).optional(),
  }).optional(),
}).partial();

function trimStringsDeep(value) {
  if (Array.isArray(value)) return value.map((item) => trimStringsDeep(item));
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = trimStringsDeep(item);
    }
    return next;
  }
  return typeof value === 'string' ? value.trim() : value;
}

router.put('/settings/site-content', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const incoming = req.body || {};
  const current = await readProjectSetting('site_content', {});

  const updated = { ...current };

  if (incoming.homepage !== undefined) {
    const parsed = homepageSchema.safeParse(incoming.homepage);
    if (!parsed.success) return fail(res, 400, 'Invalid homepage settings', parsed.error.flatten());
    const mergedHomepage = { ...(current.homepage || {}), ...trimStringsDeep(parsed.data) };

    if (incoming.homepage.eventsInspireSection !== undefined) {
      const parsedSection = inspireSectionSchema.safeParse(incoming.homepage.eventsInspireSection);
      if (!parsedSection.success) return fail(res, 400, 'Invalid homepage.eventsInspireSection', parsedSection.error.flatten());
      const currentSection = current.homepage?.eventsInspireSection || {};
      const incomingSection = trimStringsDeep(parsedSection.data);
      mergedHomepage.eventsInspireSection = {
        ...currentSection,
        ...incomingSection,
        timeline: incomingSection.timeline !== undefined
          ? { ...(currentSection.timeline || {}), ...incomingSection.timeline }
          : currentSection.timeline,
        cta: incomingSection.cta !== undefined
          ? { ...(currentSection.cta || {}), ...incomingSection.cta }
          : currentSection.cta,
        gallery: incomingSection.gallery !== undefined
          ? incomingSection.gallery
          : currentSection.gallery,
      };
    }

    updated.homepage = mergedHomepage;
  }

  if (incoming.contactPage !== undefined) {
    const parsed = contactPageSchema.safeParse(incoming.contactPage);
    if (!parsed.success) return fail(res, 400, 'Invalid contactPage settings', parsed.error.flatten());
    const currentContact = current.contactPage || {};
    const incomingContact = trimStringsDeep(parsed.data);
    updated.contactPage = {
      ...currentContact,
      ...incomingContact,
      hero: incomingContact.hero !== undefined
        ? { ...(currentContact.hero || {}), ...incomingContact.hero }
        : currentContact.hero,
      requestSection: incomingContact.requestSection !== undefined
        ? {
            ...(currentContact.requestSection || {}),
            ...incomingContact.requestSection,
            benefits: incomingContact.requestSection.benefits !== undefined
              ? incomingContact.requestSection.benefits
              : currentContact.requestSection?.benefits,
          }
        : currentContact.requestSection,
      successState: incomingContact.successState !== undefined
        ? { ...(currentContact.successState || {}), ...incomingContact.successState }
        : currentContact.successState,
      contactCards: incomingContact.contactCards !== undefined
        ? incomingContact.contactCards
        : currentContact.contactCards,
    };
  }

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
  const allowedToplevel = ['menu', 'faqs', 'whyUsCards', 'footerLinks', 'socialLinks', 'seo'];
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
