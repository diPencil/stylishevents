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
  const event = await query(`
    INSERT INTO events (slug, title_en, title_ar, summary_en, summary_ar, description_en, description_ar, type, status, starts_at, ends_at, cover_image_url, max_attendees)
    VALUES (:slug, 'Codex Customer Event', 'فعالية كوديكس', 'Customer-safe summary', 'ملخص آمن للعميل', 'Public event description', 'وصف عام للفعالية', 'conference', 'published', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), '/uploads/assets/codex-cover.png', 100)
  `, { slug: `${base}-event-${randomBytes(2).toString('hex')}` });
  if (overrides.titleEn || Object.prototype.hasOwnProperty.call(overrides, 'coverImage') || overrides.bannerImage || overrides.galleryJson) {
    await query(
      `UPDATE events
       SET title_en = COALESCE(:titleEn, title_en),
           cover_image_url = :coverImage,
           banner_image_url = :bannerImage,
           gallery_json = :galleryJson
       WHERE id = :eventId`,
      {
        eventId: event.insertId,
        titleEn: overrides.titleEn || null,
        coverImage: Object.prototype.hasOwnProperty.call(overrides, 'coverImage') ? overrides.coverImage : '/uploads/assets/codex-cover.png',
        bannerImage: overrides.bannerImage || null,
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
  return { doctorId: doctor.insertId, eventId: event.insertId, ticketTypeId: ticketType.insertId, orderId: order.insertId, registrationId: registration.insertId, attendeeId: attendee.insertId, ticketId: ticket.insertId, qrToken };
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  fixture.customerA = await createUser('customer', 1);
  fixture.customerB = await createUser('customer', 2);
  fixture.staff = await createUser('employee', 1);
  const employeeRole = await roleId('employee', 'Employee');
  await query(`
    INSERT INTO role_permissions (role_id, permission_key, allowed)
    VALUES (:roleId, 'checkin.manage', 1)
    ON DUPLICATE KEY UPDATE allowed = 1
  `, { roleId: employeeRole });
  fixture.valid = await createTicketFixture(fixture.customerA);
  fixture.pending = await createTicketFixture(fixture.customerA, 'pending_verification');
  fixture.revoked = await createTicketFixture(fixture.customerA, 'approved', 'revoked');
});

after(async () => {
  await query('DELETE FROM checkin_logs WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
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
