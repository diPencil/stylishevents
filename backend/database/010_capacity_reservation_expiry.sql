ALTER TABLE orders
  MODIFY status ENUM('draft', 'pending_payment', 'paid', 'cancelled', 'refunded', 'expired') NOT NULL DEFAULT 'pending_payment';

ALTER TABLE registrations
  MODIFY registration_status ENUM('pending_payment', 'pending_verification', 'approved', 'rejected', 'cancelled', 'expired') NOT NULL DEFAULT 'pending_payment',
  MODIFY payment_status ENUM('pending', 'approved', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reservation_expires_at DATETIME NULL AFTER payment_proof_url,
  ADD COLUMN IF NOT EXISTS capacity_reservation_status ENUM('none', 'active', 'released', 'expired') NOT NULL DEFAULT 'active' AFTER reservation_expires_at,
  ADD COLUMN IF NOT EXISTS capacity_released_at DATETIME NULL AFTER capacity_reservation_status,
  ADD COLUMN IF NOT EXISTS capacity_release_reason VARCHAR(120) NULL AFTER capacity_released_at;

UPDATE registrations
SET capacity_reservation_status = CASE
    WHEN registration_status IN ('rejected', 'cancelled', 'expired') THEN 'released'
    ELSE 'active'
  END,
  capacity_released_at = CASE
    WHEN registration_status IN ('rejected', 'cancelled', 'expired') THEN COALESCE(capacity_released_at, updated_at)
    ELSE capacity_released_at
  END,
  capacity_release_reason = CASE
    WHEN registration_status IN ('rejected', 'cancelled', 'expired') THEN COALESCE(capacity_release_reason, registration_status)
    ELSE capacity_release_reason
  END
WHERE capacity_reservation_status IS NULL OR capacity_reservation_status = 'none';

CREATE INDEX idx_registrations_capacity_expiry ON registrations (capacity_reservation_status, reservation_expires_at);
CREATE INDEX idx_registrations_capacity_lookup ON registrations (event_id, ticket_type_id, capacity_reservation_status, registration_status);
