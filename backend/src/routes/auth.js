import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import { first, query, transaction } from '../db/mysql.js';
import { asyncRoute, fail, ok } from '../utils/apiResponse.js';
import { auditLog, createToken, getRolePermissionKeys, hashPassword, verifyPassword } from '../utils/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, '..', '..', 'uploads', 'avatars');

const loginSchema = z.object({
  login: z.string().min(2),
  password: z.string().min(8),
});

const bootstrapSchema = z.object({
  name: z.string().min(2).default('Super Admin'),
  email: z.string().email(),
  username: z.string().min(3).optional().nullable(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8),
  bootstrapKey: z.string().optional().nullable(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3).optional().nullable(),
  phone: z.string().min(4).optional().nullable(),
  company: z.string().max(180).optional().nullable(),
  countryCode: z.string().min(2).max(2).transform((value) => value.toUpperCase()),
  countryName: z.string().min(2).max(120),
  gender: z.enum(['male', 'female', 'not_specified']).default('not_specified'),
  preferredLanguage: z.enum(['ar', 'en']).default('en'),
  avatarUrl: z.string().max(500).optional().nullable(),
  password: z.string().min(8),
});

const forgotPasswordSchema = z.object({
  login: z.string().min(3),
});

const avatarUploadSchema = z.object({
  fileName: z.string().min(1).max(180),
  dataUrl: z.string().min(30),
});

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  username: z.string().min(3).optional().nullable(),
  countryCode: z.string().min(2).max(2).optional().nullable().transform((value) => value ? value.toUpperCase() : value),
  countryName: z.string().max(120).optional().nullable(),
  gender: z.enum(['male', 'female', 'not_specified']).optional(),
  preferredLanguage: z.enum(['ar', 'en']).optional(),
  avatarUrl: z.string().max(500).optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

function verifyAvatarImageBuffer(mime, buffer) {
  if (!buffer?.length) return false;
  if (mime === 'image/png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === 'image/jpeg' || mime === 'image/jpg') return buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
  if (mime === 'image/webp') return buffer.length > 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

async function removeLocalAvatar(url) {
  const value = String(url || '');
  if (!value.startsWith('/uploads/avatars/')) return;
  const fileName = path.basename(value);
  if (!fileName || fileName !== value.split('/').pop()) return;
  await fs.rm(path.join(uploadRoot, fileName), { force: true }).catch(() => undefined);
}

async function saveAvatarUpload({ fileName, dataUrl }) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    const error = new Error('Only png, jpg, and webp images are allowed');
    error.statusCode = 400;
    throw error;
  }

  const extensionByMime = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
  };
  const extension = extensionByMime[match[1]];
  const buffer = Buffer.from(match[2], 'base64');
  if (!verifyAvatarImageBuffer(match[1], buffer)) {
    const error = new Error('Invalid or corrupted image file');
    error.statusCode = 400;
    throw error;
  }
  if (buffer.length > 2 * 1024 * 1024) {
    const error = new Error('Avatar image must be 2MB or smaller');
    error.statusCode = 413;
    throw error;
  }

  await fs.mkdir(uploadRoot, { recursive: true });
  const safeBase = fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'avatar';
  const savedFileName = `${Date.now()}-${safeBase}.${extension}`;
  await fs.writeFile(path.join(uploadRoot, savedFileName), buffer);

  return `/uploads/avatars/${savedFileName}`;
}

router.post('/login', asyncRoute(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const user = await first(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.country_code,
      u.country_name,
      u.gender,
      u.username,
      u.password_hash,
      u.status,
      u.preferred_language,
      u.avatar_url,
      r.code AS role_code,
      r.name_en AS role_name_en,
      r.name_ar AS role_name_ar
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = :login OR u.username = :login
    LIMIT 1
  `, { login: parsed.data.login });

  if (!user || user.status !== 'active') return fail(res, 401, 'Invalid credentials');
  const validPassword = await verifyPassword(parsed.data.password, user.password_hash);
  if (!validPassword) return fail(res, 401, 'Invalid credentials');

  await query('UPDATE users SET last_login_at = NOW() WHERE id = :id', { id: user.id });
  await auditLog({ ...req, user }, 'auth.login', 'user', user.id);

  delete user.password_hash;
  user.permissions = await getRolePermissionKeys(user.role_code);
  ok(res, { user, token: createToken(user) }, 'Logged in successfully');
}));

router.post('/avatar-upload', asyncRoute(async (req, res) => {
  const parsed = avatarUploadSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  try {
    const url = await saveAvatarUpload(parsed.data);
    ok(res, { url }, 'Avatar uploaded');
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Avatar upload failed');
  }
}));

router.post('/me/avatar-upload', requireAuth, asyncRoute(async (req, res) => {
  const parsed = avatarUploadSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  try {
    const current = await first('SELECT avatar_url FROM users WHERE id = :id LIMIT 1', { id: req.user.id });
    const url = await saveAvatarUpload(parsed.data);
    await query('UPDATE users SET avatar_url = :url WHERE id = :id', {
      id: req.user.id,
      url,
    });
    await removeLocalAvatar(current?.avatar_url);
    await auditLog(req, 'auth.avatar_update', 'user', req.user.id);
    ok(res, { url, avatar_url: url }, 'Profile photo uploaded');
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Profile photo upload failed');
  }
}));

router.delete('/me/avatar', requireAuth, asyncRoute(async (req, res) => {
  const current = await first('SELECT avatar_url FROM users WHERE id = :id LIMIT 1', { id: req.user.id });
  await query('UPDATE users SET avatar_url = NULL WHERE id = :id', { id: req.user.id });
  await removeLocalAvatar(current?.avatar_url);
  await auditLog(req, 'auth.avatar_remove', 'user', req.user.id);
  ok(res, { id: req.user.id, avatar_url: null }, 'Profile photo removed');
}));

router.post('/register', asyncRoute(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const role = await first("SELECT id FROM roles WHERE code = 'customer' LIMIT 1");
  if (!role) return fail(res, 500, 'Customer role is missing');

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
        'active',
        :preferredLanguage,
        :avatarUrl,
        :notes
      )
    `, {
      roleId: role.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      countryCode: parsed.data.countryCode,
      countryName: parsed.data.countryName,
      gender: parsed.data.gender,
      username: parsed.data.username || null,
      passwordHash,
      preferredLanguage: parsed.data.preferredLanguage,
      avatarUrl: parsed.data.avatarUrl || null,
      notes: parsed.data.company ? `Company: ${parsed.data.company}` : null,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Email or username already exists');
    throw error;
  }

  const user = await first(`
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
      r.code AS role_code,
      r.name_en AS role_name_en,
      r.name_ar AS role_name_ar
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = :id
    LIMIT 1
  `, { id: result.insertId });

  await auditLog({ ...req, user }, 'auth.register', 'user', user.id);
  user.permissions = await getRolePermissionKeys(user.role_code);
  ok(res, { user, token: createToken(user) }, 'Account created successfully');
}));

router.post('/forgot-password', asyncRoute(async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const user = await first(`
    SELECT id, email, username
    FROM users
    WHERE email = :login OR username = :login
    LIMIT 1
  `, { login: parsed.data.login });

  if (user) {
    await auditLog({ ...req, user }, 'auth.password_reset_requested', 'user', user.id);
  }

  ok(res, { requested: true }, 'If this account exists, reset instructions will be sent.');
}));

router.get('/me', requireAuth, asyncRoute(async (req, res) => {
  ok(res, req.user);
}));

router.patch('/me', requireAuth, asyncRoute(async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const current = req.user;
  const profile = {
    name: parsed.data.name ?? current.name,
    email: parsed.data.email ?? current.email,
    phone: parsed.data.phone ?? current.phone ?? null,
    countryCode: parsed.data.countryCode ?? current.country_code ?? null,
    countryName: parsed.data.countryName ?? current.country_name ?? null,
    gender: parsed.data.gender ?? current.gender ?? 'not_specified',
    username: parsed.data.username ?? current.username ?? null,
    preferredLanguage: parsed.data.preferredLanguage ?? current.preferred_language,
    avatarUrl: parsed.data.avatarUrl ?? current.avatar_url ?? null,
    id: current.id,
  };

  await transaction(async (connection) => {
    await connection.execute(`
      UPDATE users
      SET
        name = :name,
        email = :email,
        phone = :phone,
        country_code = :countryCode,
        country_name = :countryName,
        gender = :gender,
        username = :username,
        preferred_language = :preferredLanguage,
        avatar_url = :avatarUrl
      WHERE id = :id
    `, profile);

    if (current.role_code === 'customer' && parsed.data.name !== undefined) {
      await connection.execute(`
        UPDATE doctors
        SET full_name = :name
        WHERE user_id = :id
      `, profile);
    }
  });

  await auditLog(req, 'auth.profile_update', 'user', current.id);
  ok(res, { ...current, ...profile, customer_full_name: current.role_code === 'customer' ? profile.name : current.customer_full_name }, 'Profile updated');
}));

router.patch('/me/password', requireAuth, asyncRoute(async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const current = await first('SELECT id, password_hash FROM users WHERE id = :id LIMIT 1', { id: req.user.id });
  if (!current) return fail(res, 404, 'User not found');

  const validPassword = await verifyPassword(parsed.data.currentPassword, current.password_hash);
  if (!validPassword) return fail(res, 401, 'Current password is incorrect');

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await query('UPDATE users SET password_hash = :passwordHash WHERE id = :id', {
    id: req.user.id,
    passwordHash,
  });

  await auditLog(req, 'auth.password_update', 'user', req.user.id);
  ok(res, { id: req.user.id }, 'Password updated');
}));

router.post('/bootstrap-admin', asyncRoute(async (req, res) => {
  const parsed = bootstrapSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Validation failed', parsed.error.flatten());

  const requiredBootstrapKey = process.env.BOOTSTRAP_ADMIN_KEY || '';
  if (requiredBootstrapKey && parsed.data.bootstrapKey !== requiredBootstrapKey) {
    return fail(res, 403, 'Invalid bootstrap key');
  }

  const existingAdmin = await first(`
    SELECT u.id
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.code = 'admin'
    LIMIT 1
  `);

  if (existingAdmin) return fail(res, 409, 'Admin user already exists');

  const adminRole = await first("SELECT id FROM roles WHERE code = 'admin'");
  if (!adminRole) return fail(res, 500, 'Admin role is missing');

  const passwordHash = await hashPassword(parsed.data.password);
  const result = await query(`
    INSERT INTO users (
      role_id,
      name,
      email,
      phone,
      username,
      password_hash,
      status,
      preferred_language
    )
    VALUES (
      :roleId,
      :name,
      :email,
      :phone,
      :username,
      :passwordHash,
      'active',
      'en'
    )
  `, {
    roleId: adminRole.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    username: parsed.data.username || null,
    passwordHash,
  });

  const user = {
    id: result.insertId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    username: parsed.data.username,
    role_code: 'admin',
    status: 'active',
    preferred_language: 'en',
  };

  await auditLog({ ...req, user }, 'auth.bootstrap_admin', 'user', user.id);
  user.permissions = await getRolePermissionKeys(user.role_code);
  ok(res, { user, token: createToken(user) }, 'Admin user created');
}));

export default router;
