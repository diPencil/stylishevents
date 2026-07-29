import express from 'express';
import { z } from 'zod';
import { first, query, transaction } from '../db/mysql.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/security.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import { auditLog } from '../utils/auth.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

const inquiryTypes = ['general', 'event_planning', 'technical_support', 'partnership', 'existing_booking', 'other'];
const statuses = ['new', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'];
const contactMethods = ['email', 'phone', 'whatsapp'];
const blockedTextPattern = /(<\s*(script|iframe|object|embed|style)\b|javascript\s*:|\son\w+\s*=|\r|\n)/i;

const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(''));
const cleanText = (min, max) => z.string().trim().min(min).max(max).refine((value) => !blockedTextPattern.test(value), 'Unsafe content is not allowed');

const publicInquirySchema = z.object({
  fullName: cleanText(2, 180),
  email: z.string().trim().toLowerCase().email().max(180).refine((value) => !blockedTextPattern.test(value), 'Invalid email'),
  phoneCountryCode: z.string().trim().max(12).regex(/^\+?[0-9]{1,5}$/).optional().or(z.literal('')),
  phoneNumber: z.string().trim().max(40).regex(/^[0-9\s().-]{0,30}$/).optional().or(z.literal('')),
  company: optionalText(180),
  inquiryType: z.enum(inquiryTypes),
  subject: cleanText(3, 220),
  message: cleanText(20, 2000),
  preferredContactMethod: z.enum(contactMethods).optional().default('email'),
  eventDate: z.string().trim().max(40).optional().or(z.literal('')),
  eventCity: optionalText(180),
  expectedAttendees: z.coerce.number().int().positive().max(1000000).optional().or(z.literal('')),
  consentAccepted: z.literal(true),
  consentVersion: z.string().trim().max(80).optional().default('contact-inquiry-v1'),
  sourcePage: z.string().trim().max(120).optional().default('/contact'),
  website: z.string().trim().max(0).optional().or(z.literal('')),
  submittedAfterMs: z.coerce.number().int().nonnegative().optional(),
}).strict().superRefine((data, ctx) => {
  if (data.inquiryType !== 'event_planning') return;
  if (data.eventDate && Number.isNaN(Date.parse(data.eventDate))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['eventDate'], message: 'Invalid event date' });
  }
});

const adminUpdateSchema = z.object({
  status: z.enum(statuses).optional(),
  adminNotes: z.string().trim().max(4000).optional().or(z.literal('')),
}).strict();

function mapInquiry(row) {
  return {
    id: Number(row.id),
    referenceCode: row.reference_code,
    fullName: row.full_name,
    email: row.email,
    phoneCountryCode: row.phone_country_code || '',
    phoneNumber: row.phone_number || '',
    company: row.company || '',
    inquiryType: row.inquiry_type,
    subject: row.subject,
    message: row.message,
    preferredContactMethod: row.preferred_contact_method || 'email',
    eventDate: row.event_date || '',
    eventCity: row.event_city || '',
    expectedAttendees: row.expected_attendees === null || row.expected_attendees === undefined ? '' : Number(row.expected_attendees),
    status: row.status,
    adminNotes: row.admin_notes || '',
    assignedTo: row.assigned_to || null,
    sourcePage: row.source_page || '',
    consentAcceptedAt: row.consent_accepted_at || '',
    consentVersion: row.consent_version || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    resolvedAt: row.resolved_at || '',
  };
}

function publicIpKey(req) {
  return String(req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
}

function isDuplicateReferenceError(error) {
  return error?.code === 'ER_DUP_ENTRY' && String(error?.message || '').includes('reference');
}

async function createInquiryWithReference(input, normalized) {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await transaction(async (connection) => {
        const [counterResult] = await connection.execute('INSERT INTO contact_inquiries_reference_counter () VALUES ()');
        const referenceCode = `INQ-${year}-${String(counterResult.insertId).padStart(6, '0')}`;

        const [insertResult] = await connection.execute(`
          INSERT INTO contact_inquiries (
            reference_code,
            full_name,
            email,
            phone_country_code,
            phone_number,
            company,
            inquiry_type,
            subject,
            message,
            preferred_contact_method,
            event_date,
            event_city,
            expected_attendees,
            status,
            source_page,
            consent_accepted_at,
            consent_version
          ) VALUES (
            :referenceCode,
            :fullName,
            :email,
            :phoneCountryCode,
            :phoneNumber,
            :company,
            :inquiryType,
            :subject,
            :message,
            :preferredContactMethod,
            :eventDate,
            :eventCity,
            :expectedAttendees,
            'new',
            :sourcePage,
            NOW(),
            :consentVersion
          )
        `, {
          referenceCode,
          fullName: input.fullName,
          email: input.email,
          phoneCountryCode: input.phoneCountryCode || null,
          phoneNumber: input.phoneNumber || null,
          company: input.company || null,
          inquiryType: input.inquiryType,
          subject: input.subject,
          message: input.message,
          preferredContactMethod: input.preferredContactMethod,
          eventDate: normalized.eventDate,
          eventCity: input.eventCity || null,
          expectedAttendees: normalized.expectedAttendees,
          sourcePage: input.sourcePage || '/contact',
          consentVersion: input.consentVersion || 'contact-inquiry-v1',
        });

        return { referenceCode, id: insertResult.insertId };
      });
    } catch (error) {
      if (isDuplicateReferenceError(error) && attempt < 2) continue;
      throw error;
    }
  }

  throw new Error('Could not create inquiry reference');
}

router.post('/', rateLimit({ windowMs: 60_000, max: 5 }), asyncRoute(async (req, res) => {
  const parsed = publicInquirySchema.safeParse(req.body || {});
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const input = parsed.data;
  if (input.website) return fail(res, 400, 'Validation failed', { fieldErrors: { website: ['Invalid submission'] } });
  if (typeof input.submittedAfterMs === 'number' && input.submittedAfterMs < 1800) {
    return fail(res, 400, 'Validation failed', { fieldErrors: { submittedAfterMs: ['Submission was too fast'] } });
  }

  const recent = await first(`
    SELECT COUNT(*) AS total
    FROM contact_inquiries
    WHERE email = :email
      AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
  `, { email: input.email });
  if (Number(recent?.total || 0) >= 3) return fail(res, 429, 'Too many requests');

  const eventDate = input.eventDate ? new Date(input.eventDate).toISOString().slice(0, 10) : null;
  const expectedAttendees = input.expectedAttendees === '' ? null : input.expectedAttendees || null;
  const { referenceCode } = await createInquiryWithReference(input, { eventDate, expectedAttendees });

  await query(`
    INSERT INTO admin_notifications (title, body, type, severity, target_url, read_at, created_at)
    VALUES (:title, :body, 'system', 'info', '/admin/contact-inquiries', NULL, NOW())
  `, {
    title: `New contact inquiry ${referenceCode}`,
    body: `${input.fullName} sent a ${input.inquiryType.replaceAll('_', ' ')} inquiry.`,
  }).catch(() => undefined);

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (adminEmail) {
    await sendEmail(adminEmail, `New contact inquiry ${referenceCode}`, {
      text: `${input.fullName} submitted ${referenceCode}.\n\nSubject: ${input.subject}\nEmail: ${input.email}`,
      html: `<p><strong>${referenceCode}</strong></p><p>${input.fullName} submitted a contact inquiry.</p><p><strong>Subject:</strong> ${input.subject}</p><p><strong>Email:</strong> ${input.email}</p>`,
    }).catch((error) => console.warn('Admin contact inquiry email failed:', error.message));
  }

  return res.status(201).json({
    success: true,
    message: 'Inquiry received',
    data: {
      referenceCode,
      status: 'new',
      createdAt: new Date().toISOString(),
    },
  });
}));

router.get('/', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const offset = Math.max(Number(req.query.offset || 0), 0);
  const search = String(req.query.search || '').trim();
  const status = statuses.includes(String(req.query.status)) ? String(req.query.status) : '';
  const type = inquiryTypes.includes(String(req.query.type)) ? String(req.query.type) : '';
  const date = String(req.query.date || '').trim();
  const params = { limit, offset, searchLike: `%${search}%`, status, type, date };
  const filters = [];
  if (search) filters.push('(reference_code LIKE :searchLike OR full_name LIKE :searchLike OR email LIKE :searchLike OR subject LIKE :searchLike OR phone_number LIKE :searchLike)');
  if (status) filters.push('status = :status');
  if (type) filters.push('inquiry_type = :type');
  if (date) filters.push('DATE(created_at) = :date');
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const rows = await query(`
    SELECT *
    FROM contact_inquiries
    ${where}
    ORDER BY created_at DESC, id DESC
    LIMIT :limit OFFSET :offset
  `, params);
  const countRow = await first(`SELECT COUNT(*) AS total FROM contact_inquiries ${where}`, params);
  const summaryRows = await query('SELECT status, COUNT(*) AS total FROM contact_inquiries GROUP BY status');

  ok(res, {
    data: rows.map(mapInquiry),
    pagination: { total: Number(countRow?.total || 0), limit, offset },
    summary: summaryRows.reduce((acc, row) => ({ ...acc, [row.status]: Number(row.total || 0) }), {}),
  });
}));

router.get('/:id', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const row = await first('SELECT * FROM contact_inquiries WHERE id = :id LIMIT 1', { id: req.params.id });
  if (!row) return fail(res, 404, 'Inquiry not found');
  ok(res, mapInquiry(row));
}));

router.patch('/:id', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const parsed = adminUpdateSchema.safeParse(req.body || {});
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());
  const current = await first('SELECT * FROM contact_inquiries WHERE id = :id LIMIT 1', { id: req.params.id });
  if (!current) return fail(res, 404, 'Inquiry not found');

  const nextStatus = parsed.data.status || current.status;
  const resolvedAtSql = ['resolved', 'closed'].includes(nextStatus) && !current.resolved_at ? 'NOW()' : current.resolved_at ? ':resolvedAt' : 'NULL';
  await query(`
    UPDATE contact_inquiries
    SET status = :status,
        admin_notes = :adminNotes,
        resolved_at = ${resolvedAtSql}
    WHERE id = :id
  `, {
    id: req.params.id,
    status: nextStatus,
    adminNotes: parsed.data.adminNotes ?? current.admin_notes,
    resolvedAt: current.resolved_at,
  });
  await auditLog(req, 'contact_inquiries.update', 'contact_inquiry', current.id, { status: nextStatus });
  const updated = await first('SELECT * FROM contact_inquiries WHERE id = :id LIMIT 1', { id: req.params.id });
  ok(res, mapInquiry(updated), 'Inquiry updated');
}));

export default router;
