import { fail } from '../utils/apiResponse.js';
import { first } from '../db/mysql.js';
import { findAuthUserById, verifyToken } from '../utils/auth.js';

function bearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice('Bearer '.length).trim();
}

export async function optionalAuth(req, res, next) {
  try {
    const token = bearerToken(req);
    if (!token) return next();

    const payload = verifyToken(token);
    if (!payload?.sub) return next();

    const user = await findAuthUserById(payload.sub);
    if (user?.status === 'active') req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function requireAuth(req, res, next) {
  try {
    const token = bearerToken(req);
    const payload = verifyToken(token);
    if (!payload?.sub) return fail(res, 401, 'Authentication required');

    const user = await findAuthUserById(payload.sub);
    if (!user || user.status !== 'active') return fail(res, 401, 'Invalid or inactive user');

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Authentication required');
    if (!roles.includes(req.user.role_code)) return fail(res, 403, 'Permission denied');
    return next();
  };
}

export function requirePermission(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) return fail(res, 401, 'Authentication required');
      if (req.user.role_code === 'admin') return next();

      const permission = await first(`
        SELECT rp.allowed
        FROM role_permissions rp
        JOIN roles r ON r.id = rp.role_id
        WHERE r.code = :roleCode
          AND rp.permission_key = :permissionKey
        LIMIT 1
      `, {
        roleCode: req.user.role_code,
        permissionKey,
      });

      if (!permission || !permission.allowed) return fail(res, 403, 'Permission denied');
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
