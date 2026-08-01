import { first } from '../db/mysql.js';
import { fail } from '../utils/apiResponse.js';

export function isGlobalStaff(user) {
  return ['admin', 'back_office'].includes(user?.role_code);
}

export function eventScopeCondition(user, alias = 'e') {
  if (isGlobalStaff(user)) return { clause: '1 = 1', params: {} };
  if (user?.role_code === 'organizer') return { clause: `${alias}.organizer_id = :scopeUserId`, params: { scopeUserId: user.id } };
  if (user?.role_code === 'employee') {
    return {
      clause: `EXISTS (
        SELECT 1
        FROM event_staff_assignments esa
        WHERE esa.event_id = ${alias}.id
          AND esa.user_id = :scopeUserId
          AND esa.is_active = 1
      )`,
      params: { scopeUserId: user.id },
    };
  }
  return { clause: '0 = 1', params: {} };
}

export async function canAccessEvent(user, eventId) {
  if (!user || !eventId) return false;
  if (isGlobalStaff(user)) return true;
  if (user.role_code === 'organizer') {
    const row = await first('SELECT id FROM events WHERE id = :eventId AND organizer_id = :userId LIMIT 1', { eventId, userId: user.id });
    return Boolean(row);
  }
  if (user.role_code === 'employee') {
    const row = await first(`
      SELECT id
      FROM event_staff_assignments
      WHERE event_id = :eventId
        AND user_id = :userId
        AND is_active = 1
      LIMIT 1
    `, { eventId, userId: user.id });
    return Boolean(row);
  }
  return false;
}

export async function requireEventScope(req, res, eventId) {
  const allowed = await canAccessEvent(req.user, Number(eventId));
  if (!allowed) {
    fail(res, 403, 'Permission denied for this event');
    return false;
  }
  return true;
}
