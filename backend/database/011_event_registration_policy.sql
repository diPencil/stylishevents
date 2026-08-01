ALTER TABLE events
  ADD COLUMN IF NOT EXISTS public_registration_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER registration_ends_at,
  ADD COLUMN IF NOT EXISTS registration_approval_mode ENUM('automatic', 'manual_review') NOT NULL DEFAULT 'automatic' AFTER public_registration_enabled,
  ADD COLUMN IF NOT EXISTS registration_access ENUM('guest_allowed', 'login_required') NOT NULL DEFAULT 'guest_allowed' AFTER registration_approval_mode,
  ADD COLUMN IF NOT EXISTS max_tickets_per_checkout INT UNSIGNED NOT NULL DEFAULT 1 AFTER registration_access,
  ADD COLUMN IF NOT EXISTS capacity_hold_hours_override INT UNSIGNED NULL AFTER max_tickets_per_checkout,
  ADD COLUMN IF NOT EXISTS manual_payment_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER capacity_hold_hours_override;

ALTER TABLE registrations
  MODIFY registration_status ENUM('pending_payment', 'pending_verification', 'pending_review', 'approved', 'rejected', 'cancelled', 'expired') NOT NULL DEFAULT 'pending_payment';

UPDATE events
SET
  public_registration_enabled = CASE WHEN status = 'published' THEN 1 ELSE public_registration_enabled END,
  registration_approval_mode = COALESCE(registration_approval_mode, 'automatic'),
  registration_access = COALESCE(registration_access, 'guest_allowed'),
  max_tickets_per_checkout = GREATEST(1, COALESCE(max_tickets_per_checkout, 1)),
  manual_payment_enabled = COALESCE(manual_payment_enabled, 1);

CREATE INDEX idx_events_public_registration_window ON events (public_registration_enabled, registration_starts_at, registration_ends_at);
CREATE INDEX idx_events_registration_policy ON events (registration_approval_mode, registration_access);
