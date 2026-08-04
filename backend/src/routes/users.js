import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { first, query, transaction } from '../db/mysql.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import { auditLog, hashPassword } from '../utils/auth.js';
import { permissionCatalog, permissionKeys } from '../auth/permissions.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, '..', '..', 'uploads', 'avatars');

router.use(requireAuth);

const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  countryCode: z.string().min(2).max(2).optional().nullable().transform((value) => value ? value.toUpperCase() : value),
  countryName: z.string().max(120).optional().nullable(),
  gender: z.enum(['male', 'female', 'not_specified']).default('not_specified'),
  username: z.string().min(3).optional().nullable(),
  password: z.string().min(8),
  roleCode: z.string().min(2),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  preferredLanguage: z.enum(['ar', 'en']).default('en'),
  avatarUrl: z.string().max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const userUpdateSchema = userCreateSchema.partial().extend({
  password: z.string().min(8).optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(['active', 'inactive', 'blocked']),
});

const passwordSchema = z.object({
  password: z.string().min(8),
});

const avatarUploadSchema = z.object({
  fileName: z.string().min(1).max(180),
  dataUrl: z.string().min(30),
});

const rolePermissionsSchema = z.object({
  permissions: z.array(z.object({
    key: z.string().min(2),
    allowed: z.boolean(),
  })),
});

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    countryCode: row.country_code,
    countryName: row.country_name,
    gender: row.gender,
    username: row.username,
    status: row.status,
    preferredLanguage: row.preferred_language,
    avatarUrl: row.avatar_url,
    notes: row.notes,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    role: {
      code: row.role_code,
      nameEn: row.role_name_en,
      nameAr: row.role_name_ar,
    },
  };
}

function mapRole(row, permissions = []) {
  return {
    id: row.id,
    code: row.code,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    permissions: permissionCatalog.map((item) => {
      const saved = permissions.find((permission) => permission.permission_key === item.key);
      return { ...item, allowed: Boolean(saved?.allowed) };
    }),
  };
}

async function getRole(roleCode) {
  return first('SELECT id, code, name_en, name_ar FROM roles WHERE code = :roleCode LIMIT 1', { roleCode });
}

async function getUser(userId) {
  const row = await first(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.country_code,
      u.country_name,
      u.gender,
      u.username,
      u.status,
      u.preferred_language,
      u.avatar_url,
      u.notes,
      u.last_login_at,
      u.created_at,
      r.code AS role_code,
      r.name_en AS role_name_en,
      r.name_ar AS role_name_ar
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = :userId
    LIMIT 1
  `, { userId });

  return row ? mapUser(row) : null;
}

async function countOtherActiveAdmins(userId) {
  const row = await first(`
    SELECT COUNT(*) AS total
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.code = 'admin'
      AND u.status = 'active'
      AND u.id <> :userId
  `, { userId });

  return Number(row?.total || 0);
}

router.get('/', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const role = String(req.query.role || '').trim();
  const status = String(req.query.status || '').trim();

  const rows = await query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.country_code,
      u.country_name,
      u.gender,
      u.username,
      u.status,
      u.preferred_language,
      u.avatar_url,
      u.notes,
      u.last_login_at,
      u.created_at,
      r.code AS role_code,
      r.name_en AS role_name_en,
      r.name_ar AS role_name_ar
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE (:search = ''
      OR u.name LIKE CONCAT('%', :search, '%')
      OR u.email LIKE CONCAT('%', :search, '%')
      OR u.username LIKE CONCAT('%', :search, '%')
      OR u.phone LIKE CONCAT('%', :search, '%'))
      AND (:role = '' OR r.code = :role)
      AND (:status = '' OR u.status = :status)
    ORDER BY
      FIELD(r.code, 'admin', 'organizer', 'back_office', 'employee', 'doctor', 'customer'),
      u.created_at DESC
  `, { search, role, status });

  ok(res, rows.map(mapUser));
}));

router.get('/roles', requirePermission('roles.manage'), asyncRoute(async (req, res) => {
  const roles = await query(`
    SELECT id, code, name_en, name_ar, created_at
    FROM roles
    ORDER BY FIELD(code, 'admin', 'organizer', 'back_office', 'employee', 'doctor', 'customer'), id
  `);

  const permissions = await query(`
    SELECT
      r.code AS role_code,
      rp.permission_key,
      rp.allowed
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
  `);

  const byRole = new Map();
  for (const role of roles) {
    byRole.set(role.code, mapRole(role));
  }

  for (const permission of permissions) {
    const role = byRole.get(permission.role_code);
    if (!role) continue;
    const target = role.permissions.find((item) => item.key === permission.permission_key);
    if (target) target.allowed = Boolean(permission.allowed);
  }

  ok(res, {
    catalog: permissionCatalog,
    roles: Array.from(byRole.values()),
  });
}));

router.put('/roles/:roleCode/permissions', requirePermission('roles.manage'), asyncRoute(async (req, res) => {
  const parsed = rolePermissionsSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const role = await getRole(req.params.roleCode);
  if (!role) return fail(res, 404, 'Role not found');

  const unknownPermission = parsed.data.permissions.find((permission) => !permissionKeys.has(permission.key));
  if (unknownPermission) return fail(res, 400, `Unknown permission: ${unknownPermission.key}`);

  if (role.code === 'admin') {
    const criticalAdminPermissions = new Set(['users.manage', 'roles.manage']);
    const criticalDisabled = parsed.data.permissions.find((permission) => (
      criticalAdminPermissions.has(permission.key) && !permission.allowed
    ));
    if (criticalDisabled) {
      return fail(res, 400, `Admin role must keep ${criticalDisabled.key}`);
    }
  }

  const finalPermissions = await transaction(async (connection) => {
    for (const permission of parsed.data.permissions) {
      await connection.execute(`
        INSERT INTO role_permissions (role_id, permission_key, allowed)
        VALUES (:roleId, :permissionKey, :allowed)
        ON DUPLICATE KEY UPDATE allowed = VALUES(allowed)
      `, {
        roleId: role.id,
        permissionKey: permission.key,
        allowed: permission.allowed ? 1 : 0,
      });
    }

    const [permissions] = await connection.execute(`
      SELECT permission_key, allowed
      FROM role_permissions
      WHERE role_id = :roleId
    `, { roleId: role.id });
    return permissions;
  });

  await auditLog(req, 'users.role_permissions_update', 'role', role.id, {
    roleCode: role.code,
    permissions: parsed.data.permissions,
  });
  ok(res, { role: mapRole(role, finalPermissions) }, 'Permissions updated');
}));

router.post('/avatar-upload', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const parsed = avatarUploadSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const match = parsed.data.dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return fail(res, 400, 'Only png, jpg, webp, and gif images are allowed');

  const extensionByMime = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const extension = extensionByMime[match[1]];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 2 * 1024 * 1024) return fail(res, 413, 'Avatar image must be 2MB or smaller');

  await fs.mkdir(uploadRoot, { recursive: true });
  const safeBase = parsed.data.fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'avatar';
  const fileName = `${Date.now()}-${safeBase}.${extension}`;
  await fs.writeFile(path.join(uploadRoot, fileName), buffer);

  ok(res, { url: `/uploads/avatars/${fileName}` }, 'Avatar uploaded');
}));

router.get('/:id', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) return fail(res, 404, 'User not found');
  ok(res, user);
}));

router.post('/', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const role = await getRole(parsed.data.roleCode);
  if (!role) return fail(res, 400, 'Role not found');
  if (role.code === 'doctor') return fail(res, 400, 'Doctor is a legacy customer role and cannot be assigned to new users');

  const passwordHash = await hashPassword(parsed.data.password);
  let result;
  try {
    result = await query(`
      INSERT INTO users (
        role_id,
        name,
        email,
        phone,
        country_code,
        country_name,
        gender,
        username,
        password_hash,
        status,
        preferred_language,
        avatar_url,
        notes
      )
      VALUES (
        :roleId,
        :name,
        :email,
        :phone,
        :countryCode,
        :countryName,
        :gender,
        :username,
        :passwordHash,
        :status,
        :preferredLanguage,
        :avatarUrl,
        :notes
      )
    `, {
      roleId: role.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      countryCode: parsed.data.countryCode || null,
      countryName: parsed.data.countryName || null,
      gender: parsed.data.gender || 'not_specified',
      username: parsed.data.username || null,
      passwordHash,
      status: parsed.data.status,
      preferredLanguage: parsed.data.preferredLanguage,
      avatarUrl: parsed.data.avatarUrl || null,
      notes: parsed.data.notes || null,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Email or username already exists');
    throw error;
  }

  await auditLog(req, 'users.create', 'user', result.insertId);
  ok(res, await getUser(result.insertId), 'User created');
}));

router.put('/:id', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const current = await getUser(req.params.id);
  if (!current) return fail(res, 404, 'User not found');

  const role = parsed.data.roleCode ? await getRole(parsed.data.roleCode) : await getRole(current.role.code);
  if (!role) return fail(res, 400, 'Role not found');
  if (role.code === 'doctor' && current.role.code !== 'doctor') {
    return fail(res, 400, 'Doctor is a legacy customer role and cannot be assigned to users');
  }

  const nextStatus = parsed.data.status ?? current.status;
  if (current.id === req.user.id && nextStatus !== 'active') {
    return fail(res, 400, 'You cannot deactivate or block your own account');
  }

  if (current.role.code === 'admin' && (role.code !== 'admin' || nextStatus !== 'active')) {
    const otherAdmins = await countOtherActiveAdmins(current.id);
    if (!otherAdmins) return fail(res, 400, 'At least one active admin account is required');
  }

  const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : null;

  try {
    await query(`
      UPDATE users
      SET
        role_id = :roleId,
        name = :name,
        email = :email,
        phone = :phone,
        country_code = :countryCode,
        country_name = :countryName,
        gender = :gender,
        username = :username,
        status = :status,
        preferred_language = :preferredLanguage,
        avatar_url = :avatarUrl,
        notes = :notes
        ${passwordHash ? ', password_hash = :passwordHash' : ''}
      WHERE id = :id
    `, {
      id: current.id,
      roleId: role.id,
      name: parsed.data.name ?? current.name,
      email: parsed.data.email ?? current.email,
      phone: parsed.data.phone ?? current.phone ?? null,
      countryCode: parsed.data.countryCode ?? current.countryCode ?? null,
      countryName: parsed.data.countryName ?? current.countryName ?? null,
      gender: parsed.data.gender ?? current.gender ?? 'not_specified',
      username: parsed.data.username ?? current.username ?? null,
      status: nextStatus,
      preferredLanguage: parsed.data.preferredLanguage ?? current.preferredLanguage,
      avatarUrl: parsed.data.avatarUrl ?? current.avatarUrl ?? null,
      notes: parsed.data.notes ?? current.notes ?? null,
      passwordHash,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Email or username already exists');
    throw error;
  }

  await auditLog(req, 'users.update', 'user', current.id);
  ok(res, await getUser(current.id), 'User updated');
}));

router.patch('/:id/status', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const current = await getUser(req.params.id);
  if (!current) return fail(res, 404, 'User not found');
  if (current.id === req.user.id && parsed.data.status !== 'active') {
    return fail(res, 400, 'You cannot deactivate or block your own account');
  }
  if (current.role.code === 'admin' && parsed.data.status !== 'active') {
    const otherAdmins = await countOtherActiveAdmins(current.id);
    if (!otherAdmins) return fail(res, 400, 'At least one active admin account is required');
  }

  await query('UPDATE users SET status = :status WHERE id = :id', { id: current.id, status: parsed.data.status });
  await auditLog(req, `users.status.${parsed.data.status}`, 'user', current.id);
  ok(res, await getUser(current.id), 'User status updated');
}));

router.patch('/:id/password', requirePermission('users.manage'), asyncRoute(async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const current = await getUser(req.params.id);
  if (!current) return fail(res, 404, 'User not found');

  const passwordHash = await hashPassword(parsed.data.password);
  await query('UPDATE users SET password_hash = :passwordHash WHERE id = :id', { id: current.id, passwordHash });
  await auditLog(req, 'users.password_reset', 'user', current.id);
  ok(res, { id: current.id }, 'Password updated');
}));

export default router;
