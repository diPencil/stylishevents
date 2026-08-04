import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { first, query } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../middleware/auth.js';

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

router.put('/settings/theme', requireAuth, requirePermission('theme_identity.manage'), asyncRoute(async (req, res) => {
  const theme = {
    primaryColor: req.body.primaryColor || '#2563eb',
    secondaryColor: req.body.secondaryColor || '#0f172a',
    accentColor: req.body.accentColor || '#7c3aed',
    radius: String(req.body.radius || '12'),
    fontFamily: req.body.fontFamily || 'Rubik',
    fontFamilyAr: req.body.fontFamilyAr || 'Cairo',
    buttonStyle: req.body.buttonStyle || 'solid',
    density: req.body.density || 'comfortable',
    logoEnUrl: req.body.logoEnUrl || '/logo.png',
    logoArUrl: req.body.logoArUrl || '/LogoAR.png',
    faviconUrl: req.body.faviconUrl || '/favicon.png',
    footerLocationEn: req.body.footerLocationEn || '26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt',
    footerLocationAr: req.body.footerLocationAr || '\u0662\u0666 \u0634\u0627\u0631\u0639 \u0637\u0631\u0627\u0628\u0644\u0633\u060c \u0639\u0628\u0627\u0633 \u0627\u0644\u0639\u0642\u0627\u062f\u060c \u0627\u0644\u062f\u0648\u0631 \u0627\u0644\u062b\u0627\u0646\u064a\u060c \u0634\u0642\u0629 \u0665\u060c \u0645\u062f\u064a\u0646\u0629 \u0646\u0635\u0631\u060c \u0627\u0644\u0642\u0627\u0647\u0631\u0629\u060c \u0645\u0635\u0631',
    footerMobile: req.body.footerMobile || '+2 0100 607 1661',
    footerWhatsapp: req.body.footerWhatsapp || '+2 0100 607 1661',
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

const safeAnchorString = z.string().min(1).max(120).regex(/^[A-Za-z0-9_-]+$/, 'Anchor must contain letters, numbers, dashes, or underscores');
const legalContentString = z.string().max(6000).refine((value) => {
  return !/(<\s*(script|iframe|object|embed|style)\b|javascript\s*:|\son\w+\s*=)/i.test(value || '');
}, 'Legal content contains unsafe markup or URLs');

const legalSectionSchema = z.object({
  id: z.string().min(1).max(120),
  enabled: z.boolean().optional(),
  anchor: safeAnchorString,
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  contentEn: legalContentString.optional(),
  contentAr: legalContentString.optional(),
});

const legalSectionsSchema = z.array(legalSectionSchema).max(20).superRefine((sections, ctx) => {
  const seenIds = new Set();
  const seenAnchors = new Set();
  sections.forEach((section, index) => {
    if (seenIds.has(section.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'id'], message: 'Duplicate section id' });
    }
    if (seenAnchors.has(section.anchor)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'anchor'], message: 'Duplicate section anchor' });
    }
    seenIds.add(section.id);
    seenAnchors.add(section.anchor);
  });
});

const legalPageSchema = z.object({
  enabled: z.boolean().optional(),
  hero: z.object({
    titleEn: z.string().max(300).optional(),
    titleAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(1200).optional(),
    descriptionAr: z.string().max(1200).optional(),
    imageUrl: safeUrlString.optional(),
    imageAltEn: z.string().max(300).optional(),
    imageAltAr: z.string().max(300).optional(),
    focalPosition: z.enum(['center', 'top', 'bottom', 'left', 'right']).optional(),
  }).partial().optional(),
  lastUpdated: z.string().max(30).optional(),
  lastUpdatedLabelEn: z.string().max(120).optional(),
  lastUpdatedLabelAr: z.string().max(120).optional(),
  sections: legalSectionsSchema.optional(),
  contact: z.object({
    email: z.string().max(200).optional(),
    phone: z.string().max(80).optional(),
    addressEn: z.string().max(300).optional(),
    addressAr: z.string().max(300).optional(),
  }).partial().optional(),
  seo: z.object({
    titleEn: z.string().max(300).optional(),
    titleAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(1000).optional(),
    descriptionAr: z.string().max(1000).optional(),
    canonicalPath: safeUrlString.optional(),
    ogImage: safeUrlString.optional(),
    robotsIndex: z.boolean().optional(),
    robotsFollow: z.boolean().optional(),
  }).partial().optional(),
}).partial();

const legalPagesSchema = z.object({
  terms: legalPageSchema.optional(),
  privacy: legalPageSchema.optional(),
}).partial();

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

const anchorOrSafeUrlString = z.string().max(2000).refine((value) => {
  if (!value) return true;
  if (value.startsWith('#')) return /^#[A-Za-z0-9_-]+$/.test(value);
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

const footerNavigationDefaults = [
  { id: 'upcoming-events', col: 'services', labelEn: 'Upcoming Events', labelAr: 'الفعاليات القادمة', href: '/upcoming-events' },
  { id: 'previous-events', col: 'services', labelEn: 'Previous Events', labelAr: 'الفعاليات السابقة', href: '/previous-events' },
  { id: 'reception-and-farewell', col: 'services', labelEn: 'Reception and Farewell', labelAr: 'الاستقبال والتوديع', href: '/reception-and-farewell' },
  { id: 'faq', col: 'services', labelEn: 'Frequently Asked Questions', labelAr: 'الأسئلة الشائعة', href: '/faq' },
  { id: 'about', col: 'support', labelEn: 'About Company', labelAr: 'عن الشركة', href: '/about' },
  { id: 'contact', col: 'support', labelEn: 'Contact Us', labelAr: 'تواصل معنا', href: '/contact' },
  { id: 'how-to-create-account', col: 'support', labelEn: 'How to Create an Account', labelAr: 'كيفية إنشاء حساب', href: '/how-to-create-account' },
  { id: 'how-to-register-for-event', col: 'support', labelEn: 'How to Register for an Event', labelAr: 'كيفية التسجيل في فعالية', href: '/how-to-register-for-event' },
];

const footerLegalDefaults = [
  { id: 'terms', labelEn: 'Terms and Conditions', labelAr: 'الشروط والأحكام', href: '/terms' },
  { id: 'privacy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية', href: '/privacy' },
];

function footerRouteId(href = '', label = '') {
  const key = `${href} ${label}`.toLowerCase();
  if (key.includes('upcoming')) return 'upcoming-events';
  if (key.includes('previous')) return 'previous-events';
  if (key.includes('reception')) return 'reception-and-farewell';
  if (key.includes('faq') || key.includes('frequently')) return 'faq';
  if (key.includes('privacy')) return 'privacy';
  if (key.includes('terms')) return 'terms';
  if (key.includes('about')) return 'about';
  if (key.includes('contact')) return 'contact';
  if (key.includes('create-account') || key.includes('create an account')) return 'how-to-create-account';
  if (key.includes('register-for-event') || key.includes('register for an event')) return 'how-to-register-for-event';
  return '';
}

const footerNavigationLinkSchema = z.object({
  id: z.string().min(1).max(120),
  col: z.enum(['services', 'support']),
  labelEn: z.string().max(160),
  labelAr: z.string().max(160),
  href: anchorOrSafeUrlString,
});

const footerLegalLinkSchema = z.object({
  id: z.enum(['terms', 'privacy']),
  labelEn: z.string().max(160),
  labelAr: z.string().max(160),
  href: anchorOrSafeUrlString,
});

function normalizeFooterLinks(savedLinks = []) {
  const source = Array.isArray(savedLinks) ? savedLinks : [];
  const savedById = new Map();
  source.forEach((link) => {
    const id = footerRouteId(link?.href, `${link?.labelEn || ''} ${link?.labelAr || ''}`) || link?.id;
    if (id) savedById.set(id, link);
  });

  return footerNavigationDefaults.map((fallback) => {
    const saved = savedById.get(fallback.id);
    return {
      ...fallback,
      ...(saved || {}),
      id: fallback.id,
      col: fallback.col,
      href: saved?.href && saved.href !== '#' ? saved.href : fallback.href,
    };
  });
}

function normalizeFooterLegalLinks(savedLegalLinks = [], savedFooterLinks = []) {
  const source = [
    ...(Array.isArray(savedLegalLinks) ? savedLegalLinks : []),
    ...(Array.isArray(savedFooterLinks) ? savedFooterLinks : []),
  ];
  const savedById = new Map();
  source.forEach((link) => {
    const id = footerRouteId(link?.href, `${link?.labelEn || ''} ${link?.labelAr || ''}`);
    if (id === 'privacy' || id === 'terms') savedById.set(id, link);
  });

  return footerLegalDefaults.map((fallback) => {
    const saved = savedById.get(fallback.id);
    return {
      ...fallback,
      ...(saved || {}),
      id: fallback.id,
      href: saved?.href && saved.href !== '#' ? saved.href : fallback.href,
    };
  });
}

const requestSetupStatCardSchema = z.object({
  id: z.string().min(1).max(120),
  value: z.string().max(80).optional(),
  labelEn: z.string().max(160).optional(),
  labelAr: z.string().max(160).optional(),
});

const featuresSectionSchema = z.object({
  enabled: z.boolean().optional(),
  eyebrowEn: z.string().max(160).optional(),
  eyebrowAr: z.string().max(160).optional(),
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
}).partial();

const homepageRequestSetupSchema = z.object({
  enabled: z.boolean().optional(),
  eyebrowEn: z.string().max(160).optional(),
  eyebrowAr: z.string().max(160).optional(),
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  supportingTextEn: z.string().max(1000).optional(),
  supportingTextAr: z.string().max(1000).optional(),
  statCards: z.array(requestSetupStatCardSchema).max(4).optional(),
  stepsEn: z.array(z.string().max(80)).length(3).optional(),
  stepsAr: z.array(z.string().max(80)).length(3).optional(),
  nextLabelEn: z.string().max(120).optional(),
  nextLabelAr: z.string().max(120).optional(),
  backLabelEn: z.string().max(120).optional(),
  backLabelAr: z.string().max(120).optional(),
  submitLabelEn: z.string().max(120).optional(),
  submitLabelAr: z.string().max(120).optional(),
  sendingLabelEn: z.string().max(120).optional(),
  sendingLabelAr: z.string().max(120).optional(),
  successTitleEn: z.string().max(300).optional(),
  successTitleAr: z.string().max(300).optional(),
  successDescriptionEn: z.string().max(1000).optional(),
  successDescriptionAr: z.string().max(1000).optional(),
}).partial();

const homepageFinalCtaSchema = z.object({
  enabled: z.boolean().optional(),
  eyebrowEn: z.string().max(160).optional(),
  eyebrowAr: z.string().max(160).optional(),
  titleEn: z.string().max(300).optional(),
  titleAr: z.string().max(300).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  primaryButtonEnabled: z.boolean().optional(),
  primaryButtonLabelEn: z.string().max(120).optional(),
  primaryButtonLabelAr: z.string().max(120).optional(),
  primaryButtonUrl: anchorOrSafeUrlString.optional(),
  primaryButtonOpenInNewTab: z.boolean().optional(),
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

const contactInquiryTypeOptionSchema = z.object({
  id: z.string().min(1).max(120),
  value: z.string().min(2).max(80).regex(/^[a-z0-9_]+$/),
  enabled: z.boolean().optional(),
  labelEn: z.string().max(160).optional(),
  labelAr: z.string().max(160).optional(),
  order: z.coerce.number().int().min(0).max(1000).optional(),
});

const contactInquiryTypeOptionsSchema = z.array(contactInquiryTypeOptionSchema).max(10).superRefine((options, ctx) => {
  const seen = new Set();
  options.forEach((option, index) => {
    if (seen.has(option.value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'value'], message: 'Duplicate inquiry type value' });
    }
    seen.add(option.value);
  });
});

const contactFormTextSchema = z.record(z.string().max(260)).optional();

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
    submitLabelEn: z.string().max(120).optional(),
    submitLabelAr: z.string().max(120).optional(),
    clearLabelEn: z.string().max(120).optional(),
    clearLabelAr: z.string().max(120).optional(),
    sendingLabelEn: z.string().max(120).optional(),
    sendingLabelAr: z.string().max(120).optional(),
    errorTitleEn: z.string().max(160).optional(),
    errorTitleAr: z.string().max(160).optional(),
    consentLabelEn: z.string().max(300).optional(),
    consentLabelAr: z.string().max(300).optional(),
    inquiryTypes: contactInquiryTypeOptionsSchema.optional(),
    fieldLabels: contactFormTextSchema,
    placeholders: contactFormTextSchema,
  }).optional(),
  successState: z.object({
    titleEn: z.string().max(300).optional(),
    titleAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(1000).optional(),
    descriptionAr: z.string().max(1000).optional(),
  }).optional(),
}).partial();

const aboutValuePointSchema = z.object({
  id: z.string().min(1).max(120),
  textEn: z.string().max(220).optional(),
  textAr: z.string().max(220).optional(),
});

const aboutImageSchema = z.object({
  id: z.string().min(1).max(120),
  imageUrl: safeUrlString.optional(),
  altEn: z.string().max(300).optional(),
  altAr: z.string().max(300).optional(),
});

const aboutCapabilityCardSchema = z.object({
  id: z.string().min(1).max(120),
  enabled: z.boolean().optional(),
  icon: z.enum(['calendar', 'ticket', 'qrCode', 'mail', 'barChart', 'users']).optional(),
  titleEn: z.string().max(180).optional(),
  titleAr: z.string().max(180).optional(),
  descriptionEn: z.string().max(800).optional(),
  descriptionAr: z.string().max(800).optional(),
});

const aboutPrincipleSchema = z.object({
  id: z.string().min(1).max(120),
  textEn: z.string().max(180).optional(),
  textAr: z.string().max(180).optional(),
});

const aboutTeamMemberSchema = z.object({
  id: z.string().min(1).max(120),
  enabled: z.boolean().optional(),
  imageUrl: safeUrlString.optional(),
  imageAltEn: z.string().max(300).optional(),
  imageAltAr: z.string().max(300).optional(),
  nameEn: z.string().max(160).optional(),
  nameAr: z.string().max(160).optional(),
  jobTitleEn: z.string().max(180).optional(),
  jobTitleAr: z.string().max(180).optional(),
  bioEn: z.string().max(800).optional(),
  bioAr: z.string().max(800).optional(),
  linkedinUrl: safeUrlString.optional(),
  email: z.string().max(254).optional().refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Invalid email'),
});

const aboutPageSchema = z.object({
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
    breadcrumbEn: z.string().max(120).optional(),
    breadcrumbAr: z.string().max(120).optional(),
  }).optional(),
  overview: z.object({
    enabled: z.boolean().optional(),
    eyebrowEn: z.string().max(160).optional(),
    eyebrowAr: z.string().max(160).optional(),
    headingEn: z.string().max(300).optional(),
    headingAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(2500).optional(),
    descriptionAr: z.string().max(2500).optional(),
    valuePoints: z.array(aboutValuePointSchema).max(3).optional(),
    images: z.array(aboutImageSchema).max(3).optional(),
    ctaEnabled: z.boolean().optional(),
    ctaLabelEn: z.string().max(120).optional(),
    ctaLabelAr: z.string().max(120).optional(),
    ctaUrl: safeUrlString.optional(),
  }).optional(),
  ecosystem: z.object({
    enabled: z.boolean().optional(),
    eyebrowEn: z.string().max(160).optional(),
    eyebrowAr: z.string().max(160).optional(),
    headingEn: z.string().max(300).optional(),
    headingAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(2000).optional(),
    descriptionAr: z.string().max(2000).optional(),
    cards: z.array(aboutCapabilityCardSchema).max(6).optional(),
  }).optional(),
  team: z.object({
    enabled: z.boolean().optional(),
    eyebrowEn: z.string().max(160).optional(),
    eyebrowAr: z.string().max(160).optional(),
    headingEn: z.string().max(300).optional(),
    headingAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(2000).optional(),
    descriptionAr: z.string().max(2000).optional(),
    members: z.array(aboutTeamMemberSchema).max(12).optional(),
  }).optional(),
  vision: z.object({
    enabled: z.boolean().optional(),
    eyebrowEn: z.string().max(160).optional(),
    eyebrowAr: z.string().max(160).optional(),
    headingEn: z.string().max(300).optional(),
    headingAr: z.string().max(300).optional(),
    descriptionEn: z.string().max(2000).optional(),
    descriptionAr: z.string().max(2000).optional(),
    principles: z.array(aboutPrincipleSchema).max(6).optional(),
    imageUrl: safeUrlString.optional(),
    imageAltEn: z.string().max(300).optional(),
    imageAltAr: z.string().max(300).optional(),
    ctaEnabled: z.boolean().optional(),
    ctaLabelEn: z.string().max(120).optional(),
    ctaLabelAr: z.string().max(120).optional(),
    ctaUrl: safeUrlString.optional(),
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

router.put('/settings/site-content', requireAuth, requirePermission('website_content.manage'), asyncRoute(async (req, res) => {
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

  if (incoming.aboutPage !== undefined) {
    const parsed = aboutPageSchema.safeParse(incoming.aboutPage);
    if (!parsed.success) return fail(res, 400, 'Invalid aboutPage settings', parsed.error.flatten());
    const currentAbout = current.aboutPage || {};
    const incomingAbout = trimStringsDeep(parsed.data);
    updated.aboutPage = {
      ...currentAbout,
      ...incomingAbout,
      hero: incomingAbout.hero !== undefined
        ? { ...(currentAbout.hero || {}), ...incomingAbout.hero }
        : currentAbout.hero,
      overview: incomingAbout.overview !== undefined
        ? {
            ...(currentAbout.overview || {}),
            ...incomingAbout.overview,
            valuePoints: incomingAbout.overview.valuePoints !== undefined
              ? incomingAbout.overview.valuePoints
              : currentAbout.overview?.valuePoints,
            images: incomingAbout.overview.images !== undefined
              ? incomingAbout.overview.images
              : currentAbout.overview?.images,
          }
        : currentAbout.overview,
      ecosystem: incomingAbout.ecosystem !== undefined
        ? {
            ...(currentAbout.ecosystem || {}),
            ...incomingAbout.ecosystem,
            cards: incomingAbout.ecosystem.cards !== undefined
              ? incomingAbout.ecosystem.cards
              : currentAbout.ecosystem?.cards,
          }
        : currentAbout.ecosystem,
      team: incomingAbout.team !== undefined
        ? {
            ...(currentAbout.team || {}),
            ...incomingAbout.team,
            members: incomingAbout.team.members !== undefined
              ? incomingAbout.team.members
              : currentAbout.team?.members,
          }
        : currentAbout.team,
      vision: incomingAbout.vision !== undefined
        ? {
            ...(currentAbout.vision || {}),
            ...incomingAbout.vision,
            principles: incomingAbout.vision.principles !== undefined
              ? incomingAbout.vision.principles
              : currentAbout.vision?.principles,
          }
        : currentAbout.vision,
    };
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

  if (incoming.legalPages !== undefined) {
    const parsed = legalPagesSchema.safeParse(incoming.legalPages);
    if (!parsed.success) return fail(res, 400, 'Invalid legalPages settings', parsed.error.flatten());
    const currentLegalPages = current.legalPages || {};
    const incomingLegalPages = trimStringsDeep(parsed.data);
    const mergeLegalPage = (pageKey) => {
      const currentPage = currentLegalPages[pageKey] || {};
      const incomingPage = incomingLegalPages[pageKey];
      if (incomingPage === undefined) return currentPage;
      return {
        ...currentPage,
        ...incomingPage,
        hero: incomingPage.hero !== undefined
          ? { ...(currentPage.hero || {}), ...incomingPage.hero }
          : currentPage.hero,
        contact: incomingPage.contact !== undefined
          ? { ...(currentPage.contact || {}), ...incomingPage.contact }
          : currentPage.contact,
        seo: incomingPage.seo !== undefined
          ? { ...(currentPage.seo || {}), ...incomingPage.seo }
          : currentPage.seo,
        sections: incomingPage.sections !== undefined
          ? incomingPage.sections
          : currentPage.sections,
      };
    };

    updated.legalPages = {
      ...currentLegalPages,
      terms: mergeLegalPage('terms'),
      privacy: mergeLegalPage('privacy'),
    };
  }

  if (incoming.featuresSection !== undefined) {
    const parsed = featuresSectionSchema.safeParse(incoming.featuresSection);
    if (!parsed.success) return fail(res, 400, 'Invalid featuresSection settings', parsed.error.flatten());
    updated.featuresSection = {
      ...(current.featuresSection || {}),
      ...trimStringsDeep(parsed.data),
    };
  }

  if (incoming.homepageRequestSetup !== undefined) {
    const parsed = homepageRequestSetupSchema.safeParse(incoming.homepageRequestSetup);
    if (!parsed.success) return fail(res, 400, 'Invalid homepageRequestSetup settings', parsed.error.flatten());
    const currentRequestSetup = current.homepageRequestSetup || {};
    const incomingRequestSetup = trimStringsDeep(parsed.data);
    updated.homepageRequestSetup = {
      ...currentRequestSetup,
      ...incomingRequestSetup,
      statCards: incomingRequestSetup.statCards !== undefined
        ? incomingRequestSetup.statCards
        : currentRequestSetup.statCards,
      stepsEn: incomingRequestSetup.stepsEn !== undefined
        ? incomingRequestSetup.stepsEn
        : currentRequestSetup.stepsEn,
      stepsAr: incomingRequestSetup.stepsAr !== undefined
        ? incomingRequestSetup.stepsAr
        : currentRequestSetup.stepsAr,
    };
  }

  if (incoming.homepageFinalCta !== undefined) {
    const parsed = homepageFinalCtaSchema.safeParse(incoming.homepageFinalCta);
    if (!parsed.success) return fail(res, 400, 'Invalid homepageFinalCta settings', parsed.error.flatten());
    updated.homepageFinalCta = {
      ...(current.homepageFinalCta || {}),
      ...trimStringsDeep(parsed.data),
    };
  }

  if (incoming.footerLinks !== undefined || current.footerLinks !== undefined) {
    const normalized = normalizeFooterLinks(incoming.footerLinks !== undefined ? incoming.footerLinks : current.footerLinks);
    const parsed = z.array(footerNavigationLinkSchema).length(8).safeParse(trimStringsDeep(normalized));
    if (!parsed.success) return fail(res, 400, 'Invalid footerLinks settings', parsed.error.flatten());
    updated.footerLinks = parsed.data;
  }

  if (incoming.footerLegalLinks !== undefined || incoming.footerLinks !== undefined || current.footerLegalLinks !== undefined || current.footerLinks !== undefined) {
    const normalized = normalizeFooterLegalLinks(
      incoming.footerLegalLinks !== undefined ? incoming.footerLegalLinks : current.footerLegalLinks,
      incoming.footerLinks !== undefined ? incoming.footerLinks : current.footerLinks
    );
    const parsed = z.array(footerLegalLinkSchema).length(2).safeParse(trimStringsDeep(normalized));
    if (!parsed.success) return fail(res, 400, 'Invalid footerLegalLinks settings', parsed.error.flatten());
    updated.footerLegalLinks = parsed.data;
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
  const allowedToplevel = ['menu', 'faqs', 'whyUsCards', 'socialLinks', 'seo'];
  for (const key of allowedToplevel) {
    if (incoming[key] !== undefined) updated[key] = incoming[key];
  }

  await writeProjectSetting('site_content', updated);
  ok(res, updated, 'Website settings saved');
}));

router.get('/settings/currency', asyncRoute(async (req, res) => {
  ok(res, await readProjectSetting('currency', {}));
}));

router.put('/settings/currency', requireAuth, requirePermission('settings.manage'), asyncRoute(async (req, res) => {
  await writeProjectSetting('currency', req.body || {});
  ok(res, req.body || {}, 'Currency settings saved');
}));

router.post('/assets/upload', requireAuth, requirePermission('website_content.manage'), asyncRoute(async (req, res) => {
  try {
    const url = await savePlatformAsset(req.body || {});
    ok(res, { url }, 'Image uploaded');
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Image upload failed');
  }
}));

export default router;
