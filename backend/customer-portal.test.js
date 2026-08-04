import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, before, test } from 'node:test';
import app from './src/server.js';
import { first, getPool, query } from './src/db/mysql.js';
import { createToken, hashPassword } from './src/utils/auth.js';

const png1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR42mP8z8AABQMBgAF9q7sAAAAASUVORK5CYII=';
const jpeg1x1 = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9]).toString('base64')}`;
const webp1x1 = `data:image/webp;base64,${Buffer.from('RIFF\u001a\u0000\u0000\u0000WEBPVP8 ', 'binary').toString('base64')}`;
const suffix = randomBytes(4).toString('hex');
const base = `codex_${suffix}`;
let server;
let baseUrl;
let fixture = {};

function localUploadPath(url) {
  const clean = String(url || '').replace(/^https?:\/\/[^/]+/i, '');
  if (!clean.startsWith('/uploads/avatars/')) return null;
  return path.resolve(process.cwd(), clean.replace(/^\//, ''));
}

function auth(user) {
  return { Authorization: `Bearer ${createToken(user)}` };
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function roleId(code, name = code) {
  await query(
    'INSERT IGNORE INTO roles (code, name_en, name_ar) VALUES (:code, :nameEn, :nameAr)',
    { code, nameEn: name, nameAr: name }
  );
  const role = await first('SELECT id FROM roles WHERE code = :code LIMIT 1', { code });
  return role.id;
}

async function createUser(roleCode, index) {
  const role = await roleId(roleCode, roleCode);
  const passwordHash = await hashPassword('CodexVerify!2026');
  const email = `${base}.${roleCode}.${index}@example.com`;
  const result = await query(`
    INSERT INTO users (role_id, name, email, phone, password_hash, status, preferred_language)
    VALUES (:roleId, :name, :email, '+201000000000', :passwordHash, 'active', 'en')
  `, { roleId: role, name: `${roleCode} ${index}`, email, passwordHash });
  return { id: result.insertId, email, role_code: roleCode, name: `${roleCode} ${index}`, status: 'active' };
}

async function createTicketFixture(customer, status = 'approved', qrStatus = 'active', overrides = {}) {
  const doctorEmail = `${base}.doctor.${randomBytes(2).toString('hex')}@example.com`;
  const doctor = await query(`
    INSERT INTO doctors (user_id, full_name, mobile, email, country_code, country_name, city, specialty, nationality, preferred_language)
    VALUES (:userId, :name, '+201000000000', :email, 'EG', 'Egypt', 'Cairo', 'General', 'Egyptian', 'en')
  `, { userId: customer.id, name: customer.name, email: doctorEmail });
  const slug = `${base}-event-${randomBytes(2).toString('hex')}`;
  const event = await query(`
    INSERT INTO events (slug, title_en, title_ar, summary_en, summary_ar, description_en, description_ar, type, status, starts_at, ends_at, cover_image_url, max_attendees)
    VALUES (:slug, 'Codex Customer Event', 'فعالية كوديكس', 'Customer-safe summary', 'ملخص آمن للعميل', 'Public event description', 'وصف عام للفعالية', 'conference', 'published', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), '/uploads/assets/codex-cover.png', 100)
  `, { slug });
  if (overrides.titleEn || Object.prototype.hasOwnProperty.call(overrides, 'coverImage') || overrides.bannerImage || overrides.detailsImage || overrides.galleryJson) {
    await query(
      `UPDATE events
       SET title_en = COALESCE(:titleEn, title_en),
           cover_image_url = :coverImage,
           banner_image_url = :bannerImage,
           event_details_image_url = :detailsImage,
           gallery_json = :galleryJson
       WHERE id = :eventId`,
      {
        eventId: event.insertId,
        titleEn: overrides.titleEn || null,
        coverImage: Object.prototype.hasOwnProperty.call(overrides, 'coverImage') ? overrides.coverImage : '/uploads/assets/codex-cover.png',
        bannerImage: overrides.bannerImage || null,
        detailsImage: overrides.detailsImage || null,
        galleryJson: overrides.galleryJson ? JSON.stringify(overrides.galleryJson) : null,
      }
    );
  }

  const ticketType = await query(`
    INSERT INTO ticket_types (event_id, name_en, name_ar, description_en, description_ar, quota, per_order_limit, is_active)
    VALUES (:eventId, 'General Admission', 'دخول عام', 'General ticket', 'تذكرة عامة', 100, 1, 1)
  `, { eventId: event.insertId });
  const order = await query(`
    INSERT INTO orders (customer_id, event_id, order_number, status, grand_total, currency, customer_name, customer_email, customer_phone)
    VALUES (:customerId, :eventId, :orderNumber, 'paid', 10, 'USD', :name, :email, '+201000000000')
  `, { customerId: customer.id, eventId: event.insertId, orderNumber: `${base}-ORD-${randomBytes(2).toString('hex')}`, name: customer.name, email: customer.email });
  const registration = await query(`
    INSERT INTO registrations (registration_number, doctor_id, event_id, ticket_type_id, order_id, registration_status, payment_status, selected_currency, selected_price)
    VALUES (:number, :doctorId, :eventId, :ticketTypeId, :orderId, :status, 'approved', 'USD', 10)
  `, { number: `${base}-REG-${randomBytes(2).toString('hex')}`, doctorId: doctor.insertId, eventId: event.insertId, ticketTypeId: ticketType.insertId, orderId: order.insertId, status });
  const qrToken = randomBytes(32).toString('hex');
  const attendee = await query(`
    INSERT INTO attendees (order_id, event_id, ticket_type_id, attendee_number, full_name, email, phone, qr_token, qr_status)
    VALUES (:orderId, :eventId, :ticketTypeId, :number, :name, :email, '+201000000000', :qrToken, :qrStatus)
  `, { orderId: order.insertId, eventId: event.insertId, ticketTypeId: ticketType.insertId, number: `${base}-ATT-${randomBytes(2).toString('hex')}`, name: customer.name, email: customer.email, qrToken, qrStatus });
  const ticket = await query(`
    INSERT INTO generated_tickets (registration_id, attendee_id, ticket_number, qr_token, generated_at)
    VALUES (:registrationId, :attendeeId, :number, :qrToken, NOW())
  `, { registrationId: registration.insertId, attendeeId: attendee.insertId, number: `${base}-TIC-${randomBytes(2).toString('hex')}`, qrToken });
  return { slug, doctorId: doctor.insertId, eventId: event.insertId, ticketTypeId: ticketType.insertId, orderId: order.insertId, registrationId: registration.insertId, attendeeId: attendee.insertId, ticketId: ticket.insertId, qrToken };
}

async function createPublicCheckoutFixture({
  status = 'published',
  quota = 10,
  maxAttendees = 10,
  startsOffset = 5,
  registrationOpen = true,
  priceEgp = 0,
  priceUsd = 0,
  approvalMode = 'automatic',
  access = 'guest_allowed',
  publicRegistrationEnabled = true,
  maxTicketsPerCheckout = 1,
  capacityHoldHoursOverride = null,
  manualPaymentEnabled = true,
} = {}) {
  const slug = `${base}-public-${randomBytes(3).toString('hex')}`;
  const event = await query(`
    INSERT INTO events (
      slug, title_en, title_ar, summary_en, summary_ar, description_en, description_ar,
      type, status, starts_at, ends_at, registration_starts_at, registration_ends_at,
      cover_image_url, max_attendees, public_registration_enabled, registration_approval_mode,
      registration_access, max_tickets_per_checkout, capacity_hold_hours_override, manual_payment_enabled
    )
    VALUES (
      :slug, 'Codex Public Checkout', 'تسجيل عام تجريبي', 'Safe public summary', 'ملخص عام آمن',
      'Public description', 'وصف عام', 'conference', :status,
      DATE_ADD(NOW(), INTERVAL :startsOffset DAY), DATE_ADD(NOW(), INTERVAL :endOffset DAY),
      ${registrationOpen ? 'DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY)' : 'DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY)'},
      '/uploads/assets/codex-public.png', :maxAttendees, :publicRegistrationEnabled, :approvalMode,
      :access, :maxTicketsPerCheckout, :capacityHoldHoursOverride, :manualPaymentEnabled
    )
  `, {
    slug,
    status,
    startsOffset,
    endOffset: startsOffset + 1,
    maxAttendees,
    publicRegistrationEnabled: publicRegistrationEnabled ? 1 : 0,
    approvalMode,
    access,
    maxTicketsPerCheckout,
    capacityHoldHoursOverride,
    manualPaymentEnabled: manualPaymentEnabled ? 1 : 0,
  });
  const ticket = await query(`
    INSERT INTO ticket_types (event_id, name_en, name_ar, description_en, description_ar, quota, per_order_limit, is_active)
    VALUES (:eventId, 'Public Pass', 'تذكرة عامة', 'Public checkout ticket', 'تذكرة تسجيل عام', :quota, 1, 1)
  `, { eventId: event.insertId, quota });
  await query(`
    INSERT INTO ticket_price_periods (ticket_type_id, label_en, label_ar, price, price_egp, price_usd, currency, starts_at, ends_at, is_active)
    VALUES (:ticketTypeId, 'Current', 'الحالي', :priceUsd, :priceEgp, :priceUsd, 'USD', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 1)
  `, { ticketTypeId: ticket.insertId, priceEgp, priceUsd });
  return { slug, eventId: event.insertId, ticketTypeId: ticket.insertId };
}

function checkoutPayload(ticketTypeId, overrides = {}) {
  const unique = randomBytes(4).toString('hex');
  return {
    idempotencyKey: `${base}-idem-${unique}`,
    ticketTypeId,
    quantity: 1,
    fullName: 'Codex Public Guest',
    mobile: '+201000000000',
    email: `${base}.public.${unique}@example.com`,
    address: 'Test address',
    countryCode: 'EG',
    countryName: 'Egypt',
    city: 'Cairo',
    specialty: 'QA',
    nationality: 'Egyptian',
    preferredLanguage: 'en',
    ...overrides,
  };
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  fixture.customerA = await createUser('customer', 1);
  fixture.customerB = await createUser('customer', 2);
  fixture.admin = await createUser('admin', 1);
  fixture.staff = await createUser('employee', 1);
  const employeeRole = await roleId('employee', 'Employee');
  await query(`
    INSERT INTO role_permissions (role_id, permission_key, allowed)
    VALUES (:roleId, 'checkin.manage', 1)
    ON DUPLICATE KEY UPDATE allowed = 1
  `, { roleId: employeeRole });
  fixture.valid = await createTicketFixture(fixture.customerA);
  await query(`
    INSERT INTO event_staff_assignments (event_id, user_id, is_active)
    VALUES (:eventId, :userId, 1)
    ON DUPLICATE KEY UPDATE is_active = 1
  `, { eventId: fixture.valid.eventId, userId: fixture.staff.id });
  fixture.pending = await createTicketFixture(fixture.customerA, 'pending_verification');
  fixture.revoked = await createTicketFixture(fixture.customerA, 'approved', 'revoked');
});

after(async () => {
  const uploadedAvatars = await query('SELECT avatar_url FROM users WHERE email LIKE :prefix', { prefix: `${base}.%@example.com` }).catch(() => []);
  for (const row of uploadedAvatars) {
    const avatarPath = localUploadPath(row.avatar_url);
    if (avatarPath) await fs.rm(avatarPath, { force: true }).catch(() => {});
  }
  await query('DELETE esa FROM event_staff_assignments esa JOIN events e ON e.id = esa.event_id WHERE e.slug LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM public_checkout_sessions WHERE customer_email LIKE :prefix OR session_key LIKE :sessionPrefix', { prefix: `${base}.%@example.com`, sessionPrefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM checkin_logs WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM reviews WHERE event_id IN (SELECT id FROM events WHERE slug LIKE :prefix) OR customer_id IN (SELECT id FROM users WHERE email LIKE :userPrefix)', { prefix: `${base}-%`, userPrefix: `${base}.%@example.com` }).catch(() => {});
  await query('DELETE FROM generated_tickets WHERE ticket_number LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM certificates WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM attendees WHERE attendee_number LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM registrations WHERE registration_number LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM orders WHERE order_number LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE slug LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM events WHERE slug LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM doctors WHERE email LIKE :prefix', { prefix: `${base}.%@example.com` }).catch(() => {});
  await query('DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE :prefix)', { prefix: `${base}.%@example.com` }).catch(() => {});
  await query('DELETE FROM users WHERE email LIKE :prefix', { prefix: `${base}.%@example.com` }).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
  await getPool().end();
});

test('customer avatar requires auth and validates real image content', async () => {
  const unauth = await api('/api/auth/me/avatar-upload', { method: 'POST', body: JSON.stringify({ fileName: 'a.png', dataUrl: png1x1 }) });
  assert.equal(unauth.response.status, 401);

  const valid = await api('/api/auth/me/avatar-upload', { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ fileName: '../avatar.png', dataUrl: png1x1 }) });
  assert.equal(valid.response.status, 200);
  assert.match(valid.body.data.url, /^\/uploads\/avatars\/[0-9]+-avatar\.png$/);

  const invalidMime = await api('/api/auth/me/avatar-upload', { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ fileName: 'avatar.svg', dataUrl: 'data:image/svg+xml;base64,PHN2Zy8+' }) });
  assert.equal(invalidMime.response.status, 400);

  const corrupt = await api('/api/auth/me/avatar-upload', { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ fileName: 'fake.png', dataUrl: 'data:image/png;base64,TVqQAAMAAAAEAAAA' }) });
  assert.equal(corrupt.response.status, 400);

  const oversized = await api('/api/auth/me/avatar-upload', { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ fileName: 'large.png', dataUrl: `data:image/png;base64,${Buffer.alloc(2 * 1024 * 1024 + 1).toString('base64')}` }) });
  assert.equal(oversized.response.status, 400);

  const removed = await api('/api/auth/me/avatar', { method: 'DELETE', headers: auth(fixture.customerA) });
  assert.equal(removed.response.status, 200);
  const user = await first('SELECT avatar_url FROM users WHERE id = :id', { id: fixture.customerA.id });
  assert.equal(user.avatar_url, null);
});

test('customer avatar replacement is owner-scoped and cleans previous local uploads', async () => {
  const firstUpload = await api('/api/auth/me/avatar-upload', {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ fileName: 'first.jpg', dataUrl: jpeg1x1 }),
  });
  assert.equal(firstUpload.response.status, 200);
  const firstUrl = firstUpload.body.data.url;
  assert.ok(await fs.stat(localUploadPath(firstUrl)).then(() => true).catch(() => false));

  const secondUpload = await api('/api/auth/me/avatar-upload', {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ fileName: 'second.webp', dataUrl: webp1x1 }),
  });
  assert.equal(secondUpload.response.status, 200);
  const secondUrl = secondUpload.body.data.url;
  assert.match(secondUrl, /^\/uploads\/avatars\/[0-9]+-second\.webp$/);
  assert.equal(await fs.stat(localUploadPath(firstUrl)).then(() => true).catch(() => false), false);
  assert.ok(await fs.stat(localUploadPath(secondUrl)).then(() => true).catch(() => false));

  const crossUser = await api('/api/auth/me/avatar-upload', {
    method: 'POST',
    headers: auth(fixture.customerB),
    body: JSON.stringify({ user_id: fixture.customerA.id, fileName: '..\\other.png', dataUrl: png1x1 }),
  });
  assert.equal(crossUser.response.status, 200);
  const ownerA = await first('SELECT avatar_url FROM users WHERE id = :id', { id: fixture.customerA.id });
  const ownerB = await first('SELECT avatar_url FROM users WHERE id = :id', { id: fixture.customerB.id });
  assert.equal(ownerA.avatar_url, secondUrl);
  assert.notEqual(ownerB.avatar_url, secondUrl);
  assert.ok(!String(ownerB.avatar_url).startsWith('data:'));
  assert.ok(!String(ownerB.avatar_url).includes('..'));

  const removedA = await api('/api/auth/me/avatar', { method: 'DELETE', headers: auth(fixture.customerA) });
  assert.equal(removedA.response.status, 200);
  assert.equal(await fs.stat(localUploadPath(secondUrl)).then(() => true).catch(() => false), false);
});

test('customer event APIs return image fallback fields without private admin data', async () => {
  const banner = await createTicketFixture(fixture.customerA, 'approved', 'active', {
    titleEn: 'Codex Banner Event',
    coverImage: null,
    bannerImage: '/uploads/assets/codex-banner.png',
  });
  const gallery = await createTicketFixture(fixture.customerA, 'approved', 'active', {
    titleEn: 'Codex Gallery Event',
    coverImage: null,
    galleryJson: [{ url: '/uploads/assets/codex-gallery.png', alt: 'Gallery fallback' }],
  });

  const registrations = await api('/api/me/registrations?perPage=25', { headers: auth(fixture.customerA) });
  assert.equal(registrations.response.status, 200);
  const payload = registrations.body.data;
  const items = Array.isArray(payload) ? payload : (payload.items || payload.data || payload.registrations || []);
  const bannerRow = items.find((item) => item.event_id === banner.eventId);
  const galleryRow = items.find((item) => item.event_id === gallery.eventId);
  assert.equal(bannerRow.cover_image_url, null);
  assert.equal(bannerRow.banner_image_url, '/uploads/assets/codex-banner.png');
  assert.equal(galleryRow.cover_image_url, null);
  assert.match(String(galleryRow.gallery_json), /codex-gallery\.png/);
  for (const row of [bannerRow, galleryRow]) {
    assert.ok(row.event_title_en);
    assert.ok(row.event_summary_en);
    assert.ok(row.event_description_en);
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'internal_notes'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'staff_notes'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'supplier_information'), false);
  }
});

test('public event DTO is safe and draft events are denied', async () => {
  const published = await createPublicCheckoutFixture({ priceEgp: 0, priceUsd: 0 });
  const visible = await api(`/api/public/events/${published.slug}`);
  assert.equal(visible.response.status, 200);
  assert.equal(visible.body.data.event.slug, published.slug);
  assert.equal(visible.body.data.event.registration_policy.approvalMode, 'automatic');
  assert.equal(visible.body.data.event.registration_policy.access, 'guest_allowed');
  assert.ok(Array.isArray(visible.body.data.tickets));
  assert.equal(Object.prototype.hasOwnProperty.call(visible.body.data, 'certificateTemplates'), false);
  assert.equal(JSON.stringify(visible.body.data).includes('qr_token'), false);
  assert.equal(JSON.stringify(visible.body.data).includes('staff'), false);

  const draft = await createPublicCheckoutFixture({ status: 'draft' });
  const hidden = await api(`/api/public/events/${draft.slug}`);
  assert.equal(hidden.response.status, 404);
});

test('event registration policy controls free automatic and free manual review checkout', async () => {
  const freeAuto = await createPublicCheckoutFixture({ priceEgp: 0, priceUsd: 0, approvalMode: 'automatic' });
  const autoPayload = checkoutPayload(freeAuto.ticketTypeId);
  const autoCheckout = await api(`/api/public/events/${freeAuto.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(autoPayload),
  });
  assert.equal(autoCheckout.response.status, 200);
  assert.equal(autoCheckout.body.data.registration.registration_status, 'approved');
  assert.equal(autoCheckout.body.data.registration.payment_status, 'approved');
  assert.equal(autoCheckout.body.data.registration.ticket_status, 'active');

  const freeManual = await createPublicCheckoutFixture({ priceEgp: 0, priceUsd: 0, approvalMode: 'manual_review' });
  const manualPayload = checkoutPayload(freeManual.ticketTypeId);
  const manualCheckout = await api(`/api/public/events/${freeManual.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(manualPayload),
  });
  assert.equal(manualCheckout.response.status, 200);
  assert.equal(manualCheckout.body.data.registration.registration_status, 'pending_review');
  assert.equal(manualCheckout.body.data.registration.payment_status, 'approved');
  assert.equal(manualCheckout.body.data.registration.ticket_status, 'not_issued');

  const registration = await first('SELECT id FROM registrations WHERE registration_number = :reference', {
    reference: manualCheckout.body.data.registration.registration_number,
  });
  const approved = await api(`/api/registrations/${registration.id}/review`, {
    method: 'PATCH',
    headers: auth(fixture.admin),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(approved.response.status, 200);
  assert.equal(approved.body.data.status, 'approved');
  const ticket = await first('SELECT id FROM generated_tickets WHERE registration_id = :registrationId', { registrationId: registration.id });
  assert.ok(ticket?.id);
});

test('event registration policy controls paid payment verification and manual review', async () => {
  const paidAuto = await createPublicCheckoutFixture({ priceEgp: 100, priceUsd: 2, approvalMode: 'automatic' });
  const autoPayload = checkoutPayload(paidAuto.ticketTypeId, { paymentReference: 'BANK-AUTO', paymentProofUrl: '/uploads/payment-proof/auto.png' });
  const autoCheckout = await api(`/api/public/events/${paidAuto.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(autoPayload),
  });
  assert.equal(autoCheckout.response.status, 200);
  assert.equal(autoCheckout.body.data.registration.registration_status, 'pending_verification');
  assert.equal(autoCheckout.body.data.registration.ticket_status, 'not_issued');
  const autoRegistration = await first('SELECT id FROM registrations WHERE registration_number = :reference', {
    reference: autoCheckout.body.data.registration.registration_number,
  });
  const autoVerify = await api(`/api/registrations/${autoRegistration.id}/payment-review`, {
    method: 'PATCH',
    headers: auth(fixture.admin),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(autoVerify.response.status, 200);
  assert.equal(autoVerify.body.data.status, 'approved');

  const paidManual = await createPublicCheckoutFixture({ priceEgp: 100, priceUsd: 2, approvalMode: 'manual_review' });
  const manualPayload = checkoutPayload(paidManual.ticketTypeId, { paymentReference: 'BANK-MANUAL', paymentProofUrl: '/uploads/payment-proof/manual.png' });
  const manualCheckout = await api(`/api/public/events/${paidManual.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(manualPayload),
  });
  assert.equal(manualCheckout.response.status, 200);
  const manualRegistration = await first('SELECT id FROM registrations WHERE registration_number = :reference', {
    reference: manualCheckout.body.data.registration.registration_number,
  });
  const manualVerify = await api(`/api/registrations/${manualRegistration.id}/payment-review`, {
    method: 'PATCH',
    headers: auth(fixture.admin),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(manualVerify.response.status, 200);
  assert.equal(manualVerify.body.data.status, 'pending_review');
  const beforeApprovalTicket = await first('SELECT id FROM generated_tickets WHERE registration_id = :registrationId', { registrationId: manualRegistration.id });
  assert.equal(beforeApprovalTicket, null);
  const manualApprove = await api(`/api/registrations/${manualRegistration.id}/review`, {
    method: 'PATCH',
    headers: auth(fixture.admin),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(manualApprove.response.status, 200);
  const afterApprovalTicket = await first('SELECT id FROM generated_tickets WHERE registration_id = :registrationId', { registrationId: manualRegistration.id });
  assert.ok(afterApprovalTicket?.id);
});

test('event registration policy enforces guest access, max tickets, and manual payment availability', async () => {
  const loginOnly = await createPublicCheckoutFixture({ access: 'login_required' });
  const guestAttempt = await api(`/api/public/events/${loginOnly.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(checkoutPayload(loginOnly.ticketTypeId)),
  });
  assert.equal(guestAttempt.response.status, 401);

  const disabledPayment = await createPublicCheckoutFixture({ priceEgp: 100, priceUsd: 2, manualPaymentEnabled: false });
  const paymentAttempt = await api(`/api/public/events/${disabledPayment.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(checkoutPayload(disabledPayment.ticketTypeId)),
  });
  assert.equal(paymentAttempt.response.status, 409);

  const maxOne = await createPublicCheckoutFixture({ maxTicketsPerCheckout: 1 });
  const tooMany = await api(`/api/public/events/${maxOne.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(checkoutPayload(maxOne.ticketTypeId, { quantity: 2 })),
  });
  assert.equal(tooMany.response.status, 400);
});

test('public checkout protects confirmation with opaque token and supports authenticated ownership', async () => {
  const fixturePublic = await createPublicCheckoutFixture({ priceEgp: 0, priceUsd: 0 });
  const payload = checkoutPayload(fixturePublic.ticketTypeId);
  const checkout = await api(`/api/public/events/${fixturePublic.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  assert.equal(checkout.response.status, 200);
  assert.ok(checkout.body.data.confirmationToken);
  const reference = checkout.body.data.registration.registration_number;

  const noToken = await api(`/api/public/events/registrations/${reference}`);
  assert.equal(noToken.response.status, 403);

  const wrongToken = await api(`/api/public/events/registrations/${reference}?token=wrong-token`);
  assert.equal(wrongToken.response.status, 403);

  const token = checkout.body.data.confirmationToken;
  const allowed = await api(`/api/public/events/registrations/${reference}?token=${encodeURIComponent(token)}`);
  assert.equal(allowed.response.status, 200);
  assert.equal(allowed.response.headers.get('cache-control'), 'no-store');
  assert.equal(allowed.response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(allowed.body.data.registration.registration_number, reference);
  assert.equal(Object.prototype.hasOwnProperty.call(allowed.body.data.registration, 'id'), false);
  assert.equal(JSON.stringify(allowed.body.data).includes('qr_token'), false);

  await query(`
    UPDATE public_checkout_sessions
    SET confirmation_token_expires_at = DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    WHERE registration_id = (
      SELECT id FROM registrations WHERE registration_number = :reference
    )
  `, { reference });
  const expiredToken = await api(`/api/public/events/registrations/${reference}?token=${encodeURIComponent(token)}`);
  assert.equal(expiredToken.response.status, 403);

  await query(`
    UPDATE doctors
    SET user_id = :userId
    WHERE email = :email
  `, { userId: fixture.customerA.id, email: payload.email });
  const owner = await api(`/api/public/events/registrations/${reference}`, { headers: auth(fixture.customerA) });
  assert.equal(owner.response.status, 200);
  const nonOwner = await api(`/api/public/events/registrations/${reference}`, { headers: auth(fixture.customerB) });
  assert.equal(nonOwner.response.status, 403);
});

test('public checkout idempotency prevents duplicates and rejects changed payloads', async () => {
  const fixturePublic = await createPublicCheckoutFixture({ priceEgp: 2500, priceUsd: 50 });
  const payload = checkoutPayload(fixturePublic.ticketTypeId);

  const firstCheckout = await api(`/api/public/events/${fixturePublic.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  assert.equal(firstCheckout.response.status, 200);

  const retry = await api(`/api/public/events/${fixturePublic.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  assert.equal(retry.response.status, 200);
  assert.equal(retry.body.data.registration.registration_number, firstCheckout.body.data.registration.registration_number);
  assert.equal(retry.body.data.repeated, true);

  const changed = await api(`/api/public/events/${fixturePublic.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, fullName: 'Changed Guest Name' }),
  });
  assert.equal(changed.response.status, 409);

  const rows = await query(`
    SELECT COUNT(*) AS total
    FROM registrations r
    JOIN doctors d ON d.id = r.doctor_id
    WHERE d.email = :email
  `, { email: payload.email });
  assert.equal(Number(rows[0].total), 1);
});

test('public checkout enforces final-seat concurrency and registration windows', async () => {
  const closed = await createPublicCheckoutFixture({ registrationOpen: false });
  const closedPayload = checkoutPayload(closed.ticketTypeId);
  const closedAttempt = await api(`/api/public/events/${closed.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(closedPayload),
  });
  assert.equal(closedAttempt.response.status, 409);

  const finalSeat = await createPublicCheckoutFixture({ quota: 1, maxAttendees: 1, priceEgp: 100, priceUsd: 2 });
  const payloadA = checkoutPayload(finalSeat.ticketTypeId);
  const payloadB = checkoutPayload(finalSeat.ticketTypeId);
  const [a, b] = await Promise.all([
    api(`/api/public/events/${finalSeat.slug}/checkout`, { method: 'POST', body: JSON.stringify(payloadA) }),
    api(`/api/public/events/${finalSeat.slug}/checkout`, { method: 'POST', body: JSON.stringify(payloadB) }),
  ]);
  const statuses = [a.response.status, b.response.status].sort();
  assert.deepEqual(statuses, [200, 409]);
  const count = await first(`
    SELECT COUNT(*) AS total
    FROM registrations
    WHERE event_id = :eventId
      AND ticket_type_id = :ticketTypeId
      AND registration_status NOT IN ('rejected', 'cancelled', 'expired')
      AND COALESCE(capacity_reservation_status, 'active') = 'active'
  `, { eventId: finalSeat.eventId, ticketTypeId: finalSeat.ticketTypeId });
  assert.equal(Number(count.total), 1);

  await query(`
    UPDATE registrations
    SET reservation_expires_at = DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    WHERE event_id = :eventId AND ticket_type_id = :ticketTypeId
  `, { eventId: finalSeat.eventId, ticketTypeId: finalSeat.ticketTypeId });

  const failedPayload = a.response.status === 409 ? payloadA : payloadB;
  const retry = await api(`/api/public/events/${finalSeat.slug}/checkout`, {
    method: 'POST',
    body: JSON.stringify(failedPayload),
  });
  assert.equal(retry.response.status, 200);

  const finalCounts = await first(`
    SELECT
      SUM(CASE WHEN registration_status = 'expired' THEN 1 ELSE 0 END) AS expired_total,
      SUM(CASE WHEN registration_status NOT IN ('rejected', 'cancelled', 'expired')
        AND COALESCE(capacity_reservation_status, 'active') = 'active' THEN 1 ELSE 0 END) AS active_total
    FROM registrations
    WHERE event_id = :eventId AND ticket_type_id = :ticketTypeId
  `, { eventId: finalSeat.eventId, ticketTypeId: finalSeat.ticketTypeId });
  assert.equal(Number(finalCounts.expired_total), 1);
  assert.equal(Number(finalCounts.active_total), 1);
});

test('public event DTO includes independent details image without private fields', async () => {
  const fixtureEvent = await createTicketFixture(fixture.customerA, 'approved', 'active', {
    titleEn: 'Codex Details Image Event',
    coverImage: '/uploads/assets/codex-cover-safe.png',
    bannerImage: '/uploads/assets/codex-hero-safe.png',
    detailsImage: '/uploads/assets/codex-details-safe.png',
  });
  const visible = await api(`/api/public/events/${fixtureEvent.slug}`);
  assert.equal(visible.response.status, 200);
  assert.equal(visible.body.data.event.cover_image_url, '/uploads/assets/codex-cover-safe.png');
  assert.equal(visible.body.data.event.banner_image_url, '/uploads/assets/codex-hero-safe.png');
  assert.equal(visible.body.data.event.event_details_image_url, '/uploads/assets/codex-details-safe.png');
  assert.equal(JSON.stringify(visible.body.data).includes('C:\\'), false);
  assert.equal(JSON.stringify(visible.body.data).includes('qr_token'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(visible.body.data.event, 'internal_notes'), false);
});

test('event review eligibility is registration-owned and event-end controlled', async () => {
  const endedApproved = await createTicketFixture(fixture.customerA);
  await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: endedApproved.eventId });

  const guest = await api(`/api/public/events/${endedApproved.slug}/review-eligibility`);
  assert.equal(guest.response.status, 401);

  const unregistered = await api(`/api/public/events/${endedApproved.slug}/review-eligibility`, { headers: auth(fixture.customerB) });
  assert.equal(unregistered.response.status, 200);
  assert.equal(unregistered.body.data.eligible, false);
  assert.equal(unregistered.body.data.state, 'not_registered');

  const eligible = await api(`/api/public/events/${endedApproved.slug}/review-eligibility`, { headers: auth(fixture.customerA) });
  assert.equal(eligible.response.status, 200);
  assert.equal(eligible.body.data.eligible, true);

  const legacyDoctor = await createUser('doctor', 99);
  const legacyFixture = await createTicketFixture(legacyDoctor);
  await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: legacyFixture.eventId });
  const legacyEligible = await api(`/api/public/events/${legacyFixture.slug}/review-eligibility`, { headers: auth(legacyDoctor) });
  assert.equal(legacyEligible.response.status, 200);
  assert.equal(legacyEligible.body.data.eligible, true);

  const futureApproved = await createTicketFixture(fixture.customerA);
  const beforeEnd = await api(`/api/public/events/${futureApproved.slug}/review-eligibility`, { headers: auth(fixture.customerA) });
  assert.equal(beforeEnd.response.status, 200);
  assert.equal(beforeEnd.body.data.eligible, false);
  assert.equal(beforeEnd.body.data.state, 'event_not_ended');

  for (const [status, state] of [
    ['pending_verification', 'registration_not_eligible'],
    ['pending_review', 'registration_not_eligible'],
    ['rejected', 'registration_not_eligible'],
    ['cancelled', 'registration_not_eligible'],
  ]) {
    const item = await createTicketFixture(fixture.customerA, status);
    await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: item.eventId });
    const result = await api(`/api/public/events/${item.slug}/review-eligibility`, { headers: auth(fixture.customerA) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.eligible, false);
    assert.equal(result.body.data.state, state);
  }
});

test('event reviews validate rating, sanitize HTML, and enforce one review per customer event', async () => {
  const fixtureEvent = await createTicketFixture(fixture.customerA);
  await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: fixtureEvent.eventId });

  const lowRating = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 0, comment: 'Bad rating' }),
  });
  assert.equal(lowRating.response.status, 400);

  const highRating = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 6, comment: 'Bad rating' }),
  });
  assert.equal(highRating.response.status, 400);

  const crossCustomer = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerB),
    body: JSON.stringify({ rating: 5, comment: 'No owned registration' }),
  });
  assert.equal(crossCustomer.response.status, 403);

  const created = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 5, comment: '<script>alert(1)</script><b>Great</b> event' }),
  });
  assert.equal(created.response.status, 200);
  assert.equal(created.body.data.status, 'pending');

  const stored = await first('SELECT id, comment, status FROM reviews WHERE customer_id = :userId AND event_id = :eventId', {
    userId: fixture.customerA.id,
    eventId: fixtureEvent.eventId,
  });
  assert.ok(stored?.id);
  assert.equal(stored.status, 'pending');
  assert.equal(String(stored.comment).includes('<'), false);
  assert.match(stored.comment, /Great event/);

  const duplicate = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 4, comment: 'Duplicate' }),
  });
  assert.equal(duplicate.response.status, 409);

  const duplicateCount = await first('SELECT COUNT(*) AS total FROM reviews WHERE customer_id = :userId AND event_id = :eventId', {
    userId: fixture.customerA.id,
    eventId: fixtureEvent.eventId,
  });
  assert.equal(Number(duplicateCount.total), 1);

  const updated = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'PATCH',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 4, comment: 'Updated review' }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.status, 'pending');
  const afterUpdate = await first('SELECT COUNT(*) AS total, MAX(rating) AS rating, MAX(status) AS status FROM reviews WHERE customer_id = :userId AND event_id = :eventId', {
    userId: fixture.customerA.id,
    eventId: fixtureEvent.eventId,
  });
  assert.equal(Number(afterUpdate.total), 1);
  assert.equal(Number(afterUpdate.rating), 4);
  assert.equal(afterUpdate.status, 'pending');

  const secondEvent = await createTicketFixture(fixture.customerA);
  await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: secondEvent.eventId });
  const otherEventReview = await api(`/api/public/events/${secondEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 5, comment: 'Different event allowed' }),
  });
  assert.equal(otherEventReview.response.status, 200);
});

test('public reviews are approved-only and admin moderation updates public average', async () => {
  const fixtureEvent = await createTicketFixture(fixture.customerA);
  await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: fixtureEvent.eventId });
  const review = await api(`/api/public/events/${fixtureEvent.slug}/review`, {
    method: 'POST',
    headers: auth(fixture.customerA),
    body: JSON.stringify({ rating: 5, comment: 'Approved public text' }),
  });
  assert.equal(review.response.status, 200);

  const beforeApproval = await api(`/api/public/events/${fixtureEvent.slug}`);
  assert.equal(beforeApproval.response.status, 200);
  assert.equal(beforeApproval.body.data.reviews.length, 0);
  assert.equal(beforeApproval.body.data.event.rating_summary.count, 0);
  assert.equal(JSON.stringify(beforeApproval.body.data).includes(fixture.customerA.email), false);
  assert.equal(JSON.stringify(beforeApproval.body.data).includes('+201'), false);

  const row = await first('SELECT id FROM reviews WHERE event_id = :eventId AND customer_id = :userId', {
    eventId: fixtureEvent.eventId,
    userId: fixture.customerA.id,
  });
  const adminList = await api(`/api/reviews?eventId=${fixtureEvent.eventId}`, { headers: auth(fixture.admin) });
  assert.equal(adminList.response.status, 200);
  assert.ok(adminList.body.data.find((item) => item.id === row.id));

  const approve = await api(`/api/reviews/${row.id}/status`, {
    method: 'PATCH',
    headers: auth(fixture.admin),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(approve.response.status, 200);

  const afterApproval = await api(`/api/public/events/${fixtureEvent.slug}`);
  assert.equal(afterApproval.response.status, 200);
  assert.equal(afterApproval.body.data.reviews.length, 1);
  assert.equal(afterApproval.body.data.event.rating_summary.count, 1);
  assert.equal(Number(afterApproval.body.data.event.rating_summary.average), 5);
  assert.equal(JSON.stringify(afterApproval.body.data).includes(fixture.customerA.email), false);
  assert.equal(JSON.stringify(afterApproval.body.data).includes('customer_id'), false);

  const reject = await api(`/api/reviews/${row.id}/status`, {
    method: 'PATCH',
    headers: auth(fixture.admin),
    body: JSON.stringify({ status: 'rejected' }),
  });
  assert.equal(reject.response.status, 200);
  const afterRejection = await api(`/api/public/events/${fixtureEvent.slug}`);
  assert.equal(afterRejection.body.data.reviews.length, 0);
  assert.equal(afterRejection.body.data.event.rating_summary.count, 0);
});

test('concurrent duplicate event reviews keep a single database row', async () => {
  const fixtureEvent = await createTicketFixture(fixture.customerA);
  await query('UPDATE events SET starts_at = DATE_SUB(NOW(), INTERVAL 3 DAY), ends_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = :eventId', { eventId: fixtureEvent.eventId });

  const [firstAttempt, secondAttempt] = await Promise.all([
    api(`/api/public/events/${fixtureEvent.slug}/review`, { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ rating: 5, comment: 'Concurrent A' }) }),
    api(`/api/public/events/${fixtureEvent.slug}/review`, { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ rating: 4, comment: 'Concurrent B' }) }),
  ]);
  assert.deepEqual([firstAttempt.response.status, secondAttempt.response.status].sort(), [200, 409]);
  const count = await first('SELECT COUNT(*) AS total FROM reviews WHERE event_id = :eventId AND customer_id = :userId', {
    eventId: fixtureEvent.eventId,
    userId: fixture.customerA.id,
  });
  assert.equal(Number(count.total), 1);
});

test('customer QR endpoint enforces ownership and eligibility', async () => {
  const missingAuth = await api(`/api/me/tickets/${fixture.valid.ticketId}/qr`);
  assert.equal(missingAuth.response.status, 401);

  const owner = await api(`/api/me/tickets/${fixture.valid.ticketId}/qr`, { headers: auth(fixture.customerA) });
  assert.equal(owner.response.status, 200);
  assert.equal(owner.response.headers.get('cache-control'), 'no-store');
  assert.equal(owner.body.data.qrPayload.length, 64);

  const nonOwner = await api(`/api/me/tickets/${fixture.valid.ticketId}/qr`, { headers: auth(fixture.customerB) });
  assert.equal(nonOwner.response.status, 404);

  const pending = await api(`/api/me/tickets/${fixture.pending.ticketId}/qr`, { headers: auth(fixture.customerA) });
  assert.equal(pending.response.status, 409);
  assert.equal(pending.body.details.state, 'not_ready');

  const revoked = await api(`/api/me/tickets/${fixture.revoked.ticketId}/qr`, { headers: auth(fixture.customerA) });
  assert.equal(revoked.response.status, 409);
  assert.equal(revoked.body.details.state, 'cancelled');
});

test('staff scanner accepts customer QR, blocks customer self check-in, and controls duplicates', async () => {
  const customerScan = await api('/api/attendees/checkin', { method: 'POST', headers: auth(fixture.customerA), body: JSON.stringify({ qrToken: fixture.valid.qrToken }) });
  assert.equal(customerScan.response.status, 403);

  const accepted = await api('/api/attendees/checkin', { method: 'POST', headers: auth(fixture.staff), body: JSON.stringify({ qrToken: fixture.valid.qrToken }) });
  assert.equal(accepted.response.status, 200);
  assert.ok(accepted.body.data.checked_in_at);

  const duplicate = await api('/api/attendees/checkin', { method: 'POST', headers: auth(fixture.staff), body: JSON.stringify({ qrToken: fixture.valid.qrToken }) });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.body.details.result, 'duplicate');

  const checkedInQr = await api(`/api/me/tickets/${fixture.valid.ticketId}/qr`, { headers: auth(fixture.customerA) });
  assert.equal(checkedInQr.response.status, 409);
  assert.equal(checkedInQr.body.details.state, 'checked_in');
});
