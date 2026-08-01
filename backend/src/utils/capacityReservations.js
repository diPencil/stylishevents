export const RESERVATION_HOLD_HOURS = Math.max(1, Number(process.env.CHECKOUT_RESERVATION_HOURS || 72));

export function activeCapacitySql(alias = 'r') {
  return `${alias}.registration_status NOT IN ('rejected', 'cancelled', 'expired')
    AND COALESCE(${alias}.capacity_reservation_status, 'active') = 'active'`;
}

export function reservationExpirySql(hours = RESERVATION_HOLD_HOURS) {
  const normalizedHours = Math.max(1, Math.min(Number(hours || RESERVATION_HOLD_HOURS), 720));
  return `DATE_ADD(NOW(), INTERVAL ${normalizedHours} HOUR)`;
}

export async function releaseExpiredReservations(connection, options = {}) {
  const eventClause = options.eventId ? 'AND event_id = :eventId' : '';
  const ticketClause = options.ticketTypeId ? 'AND ticket_type_id = :ticketTypeId' : '';
  const [result] = await connection.execute(`
    UPDATE registrations
    SET
      registration_status = 'expired',
      payment_status = 'expired',
      capacity_reservation_status = 'expired',
      capacity_released_at = COALESCE(capacity_released_at, NOW()),
      capacity_release_reason = COALESCE(capacity_release_reason, 'payment_deadline_expired')
    WHERE registration_status = 'pending_payment'
      AND COALESCE(capacity_reservation_status, 'active') = 'active'
      AND reservation_expires_at IS NOT NULL
      AND reservation_expires_at <= NOW()
      ${eventClause}
      ${ticketClause}
  `, {
    eventId: options.eventId || 0,
    ticketTypeId: options.ticketTypeId || 0,
  });

  if (result.affectedRows) {
    await connection.execute(`
      UPDATE orders o
      JOIN registrations r ON r.order_id = o.id
      SET o.status = 'expired'
      WHERE r.registration_status = 'expired'
        AND r.capacity_release_reason = 'payment_deadline_expired'
        AND o.status = 'pending_payment'
        ${options.eventId ? 'AND r.event_id = :eventId' : ''}
        ${options.ticketTypeId ? 'AND r.ticket_type_id = :ticketTypeId' : ''}
    `, {
      eventId: options.eventId || 0,
      ticketTypeId: options.ticketTypeId || 0,
    });
  }

  return Number(result.affectedRows || 0);
}

export async function countActiveReservations(connection, eventId, ticketTypeId) {
  const [rows] = await connection.execute(`
    SELECT
      SUM(CASE WHEN ticket_type_id = :ticketTypeId THEN 1 ELSE 0 END) AS ticket_reserved_count,
      COUNT(*) AS event_reserved_count
    FROM registrations r
    WHERE r.event_id = :eventId
      AND ${activeCapacitySql('r')}
  `, { eventId, ticketTypeId });

  return {
    ticketReservedCount: Number(rows[0]?.ticket_reserved_count || 0),
    eventReservedCount: Number(rows[0]?.event_reserved_count || 0),
  };
}
