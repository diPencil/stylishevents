import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { after, before, test } from 'node:test';
import app from './src/server.js';
import { first, getPool, query } from './src/db/mysql.js';
import { createToken, hashPassword } from './src/utils/auth.js';

const suffix = randomBytes(4).toString('hex');
const base = `codex_auth_${suffix}`;
let server;
let baseUrl;
let fixture = {};

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

async function setRolePermission(roleIdValue, permissionKey, allowed) {
  await query(`
    INSERT INTO role_permissions (role_id, permission_key, allowed)
    VALUES (:roleId, :permissionKey, :allowed)
    ON DUPLICATE KEY UPDATE allowed = VALUES(allowed)
  `, { roleId: roleIdValue, permissionKey, allowed: allowed ? 1 : 0 });
}

async function createUser(roleCode, index) {
  const role = await roleId(roleCode, roleCode);
  const passwordHash = await hashPassword('CodexAuth!2026');
  const email = `${base}.${roleCode}.${index}@example.com`;
  const result = await query(`
    INSERT INTO users (role_id, name, email, phone, password_hash, status, preferred_language)
    VALUES (:roleId, :name, :email, '+201000000000', :passwordHash, 'active', 'en')
  `, { roleId: role, name: `${roleCode} ${index}`, email, passwordHash });
  return { id: result.insertId, email, role_code: roleCode, name: `${roleCode} ${index}`, status: 'active' };
}

async function createScopedEvent(organizer, label) {
  const result = await query(`
    INSERT INTO events (organizer_id, slug, title_en, title_ar, summary_en, summary_ar, description_en, description_ar, type, status, starts_at, ends_at, cover_image_url, max_attendees)
    VALUES (:organizerId, :slug, :titleEn, :titleAr, 'summary', 'ملخص', 'description', 'وصف', 'conference', 'published', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), '/uploads/assets/codex-cover.png', 100)
  `, {
    organizerId: organizer.id,
    slug: `${base}-scope-${label}-${randomBytes(2).toString('hex')}`,
    titleEn: `Scoped ${label}`,
    titleAr: `نطاق ${label}`,
  });
  return { id: result.insertId, organizerId: organizer.id };
}

async function createAttendeeForEvent(event, label) {
  const ticketType = await query(`
    INSERT INTO ticket_types (event_id, name_en, name_ar, description_en, description_ar, quota, per_order_limit, is_active)
    VALUES (:eventId, :nameEn, :nameAr, 'Ticket', 'تذكرة', 100, 1, 1)
  `, { eventId: event.id, nameEn: `Ticket ${label}`, nameAr: `تذكرة ${label}` });
  const order = await query(`
    INSERT INTO orders (event_id, order_number, status, grand_total, currency, customer_name, customer_email, customer_phone)
    VALUES (:eventId, :orderNumber, 'paid', 10, 'USD', 'Scope User', :email, '+201000000000')
  `, { eventId: event.id, orderNumber: `${base}-ORD-${label}-${randomBytes(2).toString('hex')}`, email: `${base}.${label}@example.com` });
  const qrToken = randomBytes(32).toString('hex');
  const attendee = await query(`
    INSERT INTO attendees (order_id, event_id, ticket_type_id, attendee_number, full_name, email, phone, qr_token, qr_status)
    VALUES (:orderId, :eventId, :ticketTypeId, :number, 'Scope Attendee', :email, '+201000000000', :qrToken, 'active')
  `, {
    orderId: order.insertId,
    eventId: event.id,
    ticketTypeId: ticketType.insertId,
    number: `${base}-ATT-${label}-${randomBytes(2).toString('hex')}`,
    email: `${base}.${label}@example.com`,
    qrToken,
  });
  return { id: attendee.insertId, eventId: event.id, qrToken };
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  fixture.admin = await createUser(`${base}_admin`, 1);
  fixture.adminRoleId = await roleId(fixture.admin.role_code);
  await setRolePermission(fixture.adminRoleId, 'users.manage', true);
  await setRolePermission(fixture.adminRoleId, 'roles.manage', true);
  await setRolePermission(fixture.adminRoleId, 'contact_inquiries.manage', true);
  await setRolePermission(fixture.adminRoleId, 'events.manage', true);
  await setRolePermission(fixture.adminRoleId, 'attendees.manage', true);
  await setRolePermission(fixture.adminRoleId, 'checkin.manage', true);
  await setRolePermission(fixture.adminRoleId, 'certificates.view', true);
  await setRolePermission(fixture.adminRoleId, 'certificates.manage', true);
  await setRolePermission(fixture.adminRoleId, 'reviews.view', true);
  await setRolePermission(fixture.adminRoleId, 'reviews.manage', true);

  fixture.rolesOnly = await createUser(`${base}_roles_only`, 1);
  fixture.rolesOnlyRoleId = await roleId(fixture.rolesOnly.role_code);
  await setRolePermission(fixture.rolesOnlyRoleId, 'roles.manage', true);
  await setRolePermission(fixture.rolesOnlyRoleId, 'users.manage', false);

  fixture.noAccess = await createUser(`${base}_no_access`, 1);
  fixture.noAccessRoleId = await roleId(fixture.noAccess.role_code);

  fixture.organizerA = await createUser('organizer', 101);
  fixture.organizerARoleId = await roleId(fixture.organizerA.role_code);
  await setRolePermission(fixture.organizerARoleId, 'events.manage', true);
  await setRolePermission(fixture.organizerARoleId, 'attendees.manage', true);
  await setRolePermission(fixture.organizerARoleId, 'certificates.view', true);
  await setRolePermission(fixture.organizerARoleId, 'certificates.manage', true);
  await setRolePermission(fixture.organizerARoleId, 'reviews.view', true);
  await setRolePermission(fixture.organizerARoleId, 'reviews.manage', true);

  fixture.organizerB = await createUser('organizer', 102);
  fixture.organizerBRoleId = await roleId(fixture.organizerB.role_code);
  await setRolePermission(fixture.organizerBRoleId, 'events.manage', true);

  fixture.employee = await createUser('employee', 101);
  fixture.employeeRoleId = await roleId(fixture.employee.role_code);
  await setRolePermission(fixture.employeeRoleId, 'checkin.manage', true);
  await setRolePermission(fixture.employeeRoleId, 'attendees.manage', true);

  fixture.doctor = await createUser('doctor', 101);
  fixture.doctorRoleId = await roleId(fixture.doctor.role_code);
  await setRolePermission(fixture.doctorRoleId, 'profile.manage', true);

  fixture.eventA = await createScopedEvent(fixture.organizerA, 'a');
  fixture.eventB = await createScopedEvent(fixture.organizerB, 'b');
  fixture.attendeeA = await createAttendeeForEvent(fixture.eventA, 'a');
  fixture.attendeeB = await createAttendeeForEvent(fixture.eventB, 'b');
  fixture.certificateAttendee = await createAttendeeForEvent(fixture.eventA, 'cert');
  await query('UPDATE attendees SET checked_in_at = NOW() WHERE id = :id', { id: fixture.certificateAttendee.id });
  fixture.reviewA = await query(`
    INSERT INTO reviews (event_id, attendee_id, rating, title, comment, status)
    VALUES (:eventId, :attendeeId, 5, 'Great', 'Scoped review', 'pending')
  `, { eventId: fixture.eventA.id, attendeeId: fixture.attendeeA.id });
  fixture.reviewB = await query(`
    INSERT INTO reviews (event_id, attendee_id, rating, title, comment, status)
    VALUES (:eventId, :attendeeId, 4, 'Other', 'Cross review', 'pending')
  `, { eventId: fixture.eventB.id, attendeeId: fixture.attendeeB.id });
  await query(`
    INSERT INTO event_staff_assignments (event_id, user_id, is_active)
    VALUES (:eventId, :userId, 1)
    ON DUPLICATE KEY UPDATE is_active = 1
  `, { eventId: fixture.eventA.id, userId: fixture.employee.id });
});

after(async () => {
  await query('DELETE esa FROM event_staff_assignments esa JOIN events e ON e.id = esa.event_id WHERE e.slug LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM checkin_logs WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM reviews WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM certificates WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM event_cards WHERE attendee_id IN (SELECT id FROM attendees WHERE attendee_number LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM certificate_templates WHERE event_id IN (SELECT id FROM events WHERE slug LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM attendees WHERE attendee_number LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM orders WHERE order_number LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE slug LIKE :prefix)', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM events WHERE slug LIKE :prefix', { prefix: `${base}-%` }).catch(() => {});
  await query('DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE :prefix)', { prefix: `${base}.%@example.com` }).catch(() => {});
  await query('DELETE FROM users WHERE email LIKE :prefix', { prefix: `${base}.%@example.com` }).catch(() => {});
  await query('DELETE rp FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.code LIKE :prefix', { prefix: `${base}%` }).catch(() => {});
  await query('DELETE FROM roles WHERE code LIKE :prefix', { prefix: `${base}%` }).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
  await getPool().end();
});

test('roles matrix endpoints require authentication and roles.manage', async () => {
  const guest = await api('/api/users/roles');
  assert.equal(guest.response.status, 401);

  const forbidden = await api('/api/users/roles', { headers: auth(fixture.noAccess) });
  assert.equal(forbidden.response.status, 403);

  const roles = await api('/api/users/roles', { headers: auth(fixture.rolesOnly) });
  assert.equal(roles.response.status, 200);

  const users = await api('/api/users', { headers: auth(fixture.rolesOnly) });
  assert.equal(users.response.status, 403);
});

test('access matrix rejects unknown permissions without partial write', async () => {
  await setRolePermission(fixture.noAccessRoleId, 'dashboard.view', false);
  const save = await api(`/api/users/roles/${fixture.noAccess.role_code}/permissions`, {
    method: 'PUT',
    headers: auth(fixture.admin),
    body: JSON.stringify({
      permissions: [
        { key: 'dashboard.view', allowed: true },
        { key: 'unknown.permission', allowed: true },
      ],
    }),
  });
  assert.equal(save.response.status, 400);
  const stored = await first(`
    SELECT rp.allowed
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    WHERE r.code = :roleCode AND rp.permission_key = 'dashboard.view'
  `, { roleCode: fixture.noAccess.role_code });
  assert.equal(Boolean(stored?.allowed), false);
});

test('permission removal applies immediately to the same token', async () => {
  const firstAccess = await api('/api/users/roles', { headers: auth(fixture.rolesOnly) });
  assert.equal(firstAccess.response.status, 200);

  const save = await api(`/api/users/roles/${fixture.rolesOnly.role_code}/permissions`, {
    method: 'PUT',
    headers: auth(fixture.admin),
    body: JSON.stringify([{ key: 'roles.manage', allowed: false }].reduce((payload, permission) => ({
      permissions: permission ? [permission] : [],
    }), { permissions: [] })),
  });
  assert.equal(save.response.status, 200);
  assert.equal(save.body.data.role.permissions.find((item) => item.key === 'roles.manage')?.allowed, false);

  const secondAccess = await api('/api/users/roles', { headers: auth(fixture.rolesOnly) });
  assert.equal(secondAccess.response.status, 403);
});

test('admin role keeps critical management permissions protected', async () => {
  const adminRole = await first("SELECT code FROM roles WHERE code = 'admin' LIMIT 1");
  if (!adminRole) return;

  const save = await api('/api/users/roles/admin/permissions', {
    method: 'PUT',
    headers: auth(fixture.admin),
    body: JSON.stringify({
      permissions: [
        { key: 'users.manage', allowed: true },
        { key: 'roles.manage', allowed: false },
      ],
    }),
  });
  assert.equal(save.response.status, 400);
});

test('inactive users are denied even with a previously valid token', async () => {
  const temporaryAdmin = await createUser(`${base}_temporary_admin`, 1);
  const temporaryRoleId = await roleId(temporaryAdmin.role_code);
  await setRolePermission(temporaryRoleId, 'roles.manage', true);

  const beforeInactive = await api('/api/users/roles', { headers: auth(temporaryAdmin) });
  assert.equal(beforeInactive.response.status, 200);

  await query("UPDATE users SET status = 'inactive' WHERE id = :id", { id: temporaryAdmin.id });
  const afterInactive = await api('/api/users/roles', { headers: auth(temporaryAdmin) });
  assert.equal(afterInactive.response.status, 401);
});

test('legacy doctor role is customer-compatible and denied from admin APIs', async () => {
  const adminUsers = await api('/api/users', { headers: auth(fixture.doctor) });
  assert.equal(adminUsers.response.status, 403);

  const adminRoles = await api('/api/users/roles', { headers: auth(fixture.doctor) });
  assert.equal(adminRoles.response.status, 403);

  const customerDashboard = await api('/api/me/dashboard', { headers: auth(fixture.doctor) });
  assert.equal(customerDashboard.response.status, 200);
});

test('contact inquiries are permission-controlled instead of admin-role-only', async () => {
  const guest = await api('/api/contact-inquiries');
  assert.equal(guest.response.status, 401);

  const forbidden = await api('/api/contact-inquiries', { headers: auth(fixture.noAccess) });
  assert.equal(forbidden.response.status, 403);

  const allowed = await api('/api/contact-inquiries', { headers: auth(fixture.admin) });
  assert.equal(allowed.response.status, 200);
});

test('organizer event and attendee access is scoped to owned events', async () => {
  const ownEvent = await api(`/api/events/${fixture.eventA.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(ownEvent.response.status, 200);

  const crossEvent = await api(`/api/events/${fixture.eventB.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(crossEvent.response.status, 403);

  const ownAttendees = await api(`/api/attendees?eventId=${fixture.eventA.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(ownAttendees.response.status, 200);

  const crossAttendees = await api(`/api/attendees?eventId=${fixture.eventB.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(crossAttendees.response.status, 403);
});

test('employee check-in requires both permission and event assignment', async () => {
  const assigned = await api('/api/attendees/checkin', {
    method: 'POST',
    headers: auth(fixture.employee),
    body: JSON.stringify({ qrToken: fixture.attendeeA.qrToken }),
  });
  assert.equal(assigned.response.status, 200);

  const cross = await api('/api/attendees/checkin', {
    method: 'POST',
    headers: auth(fixture.employee),
    body: JSON.stringify({ qrToken: fixture.attendeeB.qrToken }),
  });
  assert.equal(cross.response.status, 403);
});

test('event and ticket mutations reject guests', async () => {
  const createEvent = await api('/api/events', {
    method: 'POST',
    body: JSON.stringify({
      slug: `${base}-guest-denied`,
      titleEn: 'Denied',
      titleAr: 'مرفوض',
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      endsAt: new Date(Date.now() + 172800000).toISOString(),
    }),
  });
  assert.equal(createEvent.response.status, 401);

  const createTicket = await api('/api/tickets', {
    method: 'POST',
    body: JSON.stringify({ eventId: fixture.eventA.id, nameEn: 'Denied', nameAr: 'مرفوض' }),
  });
  assert.equal(createTicket.response.status, 401);
});

test('certificate APIs require permission and event scope', async () => {
  const guest = await api('/api/certificates/delivery');
  assert.equal(guest.response.status, 401);

  const employeeDenied = await api(`/api/certificates/delivery?eventId=${fixture.eventA.id}`, { headers: auth(fixture.employee) });
  assert.equal(employeeDenied.response.status, 403);

  const ownDelivery = await api(`/api/certificates/delivery?eventId=${fixture.eventA.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(ownDelivery.response.status, 200);

  const crossDelivery = await api(`/api/certificates/delivery?eventId=${fixture.eventB.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(crossDelivery.response.status, 403);

  await setRolePermission(fixture.organizerARoleId, 'certificates.manage', false);
  const viewOnlyIssue = await api('/api/certificates/issue', {
    method: 'POST',
    headers: auth(fixture.organizerA),
    body: JSON.stringify({ attendeeId: fixture.certificateAttendee.id }),
  });
  assert.equal(viewOnlyIssue.response.status, 403);

  await setRolePermission(fixture.organizerARoleId, 'certificates.manage', true);
  const issued = await api('/api/certificates/issue', {
    method: 'POST',
    headers: auth(fixture.organizerA),
    body: JSON.stringify({ attendeeId: fixture.certificateAttendee.id }),
  });
  assert.equal(issued.response.status, 200);
});

test('review APIs require permission and event scope', async () => {
  const guest = await api('/api/reviews');
  assert.equal(guest.response.status, 401);

  const ownReviews = await api(`/api/reviews?eventId=${fixture.eventA.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(ownReviews.response.status, 200);

  const crossReviews = await api(`/api/reviews?eventId=${fixture.eventB.id}`, { headers: auth(fixture.organizerA) });
  assert.equal(crossReviews.response.status, 403);

  await setRolePermission(fixture.organizerARoleId, 'reviews.manage', false);
  const viewOnlyModeration = await api(`/api/reviews/${fixture.reviewA.insertId}/status`, {
    method: 'PATCH',
    headers: auth(fixture.organizerA),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(viewOnlyModeration.response.status, 403);

  await setRolePermission(fixture.organizerARoleId, 'reviews.manage', true);
  const moderation = await api(`/api/reviews/${fixture.reviewA.insertId}/status`, {
    method: 'PATCH',
    headers: auth(fixture.organizerA),
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(moderation.response.status, 200);
});
