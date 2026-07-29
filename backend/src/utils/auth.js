import crypto from 'crypto';
import { first, query } from '../db/mysql.js';

const tokenSecret = process.env.AUTH_TOKEN_SECRET || process.env.JWT_SECRET || 'change-this-secret-before-production';
const tokenTtlSeconds = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 8);

function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signPayload(payload) {
  return crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url');
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString('hex'));
    });
  });

  return `scrypt:${salt}:${derived}`;
}

export async function verifyPassword(password, passwordHash = '') {
  const [scheme, salt, stored] = passwordHash.split(':');
  if (scheme !== 'scrypt' || !salt || !stored) return false;

  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString('hex'));
    });
  });

  const derivedBuffer = Buffer.from(derived, 'hex');
  const storedBuffer = Buffer.from(stored, 'hex');
  if (derivedBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
}

export function createToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    role: user.role_code,
    email: user.email,
    iat: now,
    exp: now + tokenTtlSeconds,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${signPayload(encoded)}`;
}

export function verifyToken(token = '') {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = signPayload(encoded);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(base64UrlDecode(encoded));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function findAuthUserById(id) {
  return first(`
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
      u.last_login_at,
      d.full_name AS customer_full_name,
      r.code AS role_code,
      r.name_en AS role_name_en,
      r.name_ar AS role_name_ar
    FROM users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN doctors d ON d.user_id = u.id
    WHERE u.id = :id
    ORDER BY d.user_id = u.id DESC, d.id DESC
    LIMIT 1
  `, { id });
}

export async function auditLog(req, action, entityType = null, entityId = null, metadata = null) {
  await query(`
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata_json,
      ip_address,
      user_agent
    )
    VALUES (
      :userId,
      :action,
      :entityType,
      :entityId,
      :metadata,
      :ipAddress,
      :userAgent
    )
  `, {
    userId: req.user?.id || null,
    action,
    entityType,
    entityId: entityId ? String(entityId) : null,
    metadata: JSON.stringify(metadata || {}),
    ipAddress: req.ip || null,
    userAgent: req.headers?.['user-agent'] || null,
  });
}
