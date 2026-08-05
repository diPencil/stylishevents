-- Stylish Events Hostinger production schema bundle
-- Generated from migrations 001 through 012 in exact order.
-- Assumes the target Hostinger database is already selected.
-- Schema only: no users, events, reviews, seed data, credentials, or database-level commands.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Migration: 001_events_platform_schema.sql
-- ============================================================================



CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NULL,
  status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  preferred_language ENUM('ar', 'en') NOT NULL DEFAULT 'ar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS venues (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(180) NOT NULL,
  name_ar VARCHAR(180) NOT NULL,
  country_code CHAR(2) NOT NULL,
  city_en VARCHAR(120) NOT NULL,
  city_ar VARCHAR(120) NOT NULL,
  address_en TEXT NULL,
  address_ar TEXT NULL,
  capacity INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organizer_id BIGINT UNSIGNED NULL,
  venue_id BIGINT UNSIGNED NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title_en VARCHAR(220) NOT NULL,
  title_ar VARCHAR(220) NOT NULL,
  summary_en TEXT NULL,
  summary_ar TEXT NULL,
  description_en MEDIUMTEXT NULL,
  description_ar MEDIUMTEXT NULL,
  type ENUM('conference', 'exhibition', 'workshop', 'festival', 'webinar', 'other') NOT NULL DEFAULT 'conference',
  status ENUM('draft', 'published', 'sold_out', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  timezone VARCHAR(80) NOT NULL DEFAULT 'Africa/Cairo',
  cover_image_url VARCHAR(500) NULL,
  max_attendees INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id),
  CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS event_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NOT NULL,
  title_en VARCHAR(220) NOT NULL,
  title_ar VARCHAR(220) NOT NULL,
  speaker_name VARCHAR(180) NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  room_name VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_sessions_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ticket_types (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NOT NULL,
  name_en VARCHAR(160) NOT NULL,
  name_ar VARCHAR(160) NOT NULL,
  description_en TEXT NULL,
  description_ar TEXT NULL,
  quota INT UNSIGNED NULL,
  per_order_limit INT UNSIGNED NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_types_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ticket_price_periods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_type_id BIGINT UNSIGNED NOT NULL,
  label_en VARCHAR(140) NOT NULL,
  label_ar VARCHAR(140) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_price_period_ticket FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NULL,
  event_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(60) NOT NULL UNIQUE,
  status ENUM('draft', 'pending_payment', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending_payment',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  customer_name VARCHAR(180) NOT NULL,
  customer_email VARCHAR(180) NOT NULL,
  customer_phone VARCHAR(40) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_orders_event FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS attendees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  event_id BIGINT UNSIGNED NOT NULL,
  ticket_type_id BIGINT UNSIGNED NOT NULL,
  attendee_number VARCHAR(70) NOT NULL UNIQUE,
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NULL,
  job_title VARCHAR(160) NULL,
  organization VARCHAR(180) NULL,
  qr_token CHAR(64) NOT NULL UNIQUE,
  qr_status ENUM('active', 'revoked', 'used') NOT NULL DEFAULT 'active',
  checked_in_at DATETIME NULL,
  certificate_issued_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendees_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendees_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_attendees_ticket FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id)
);

CREATE TABLE IF NOT EXISTS checkin_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attendee_id BIGINT UNSIGNED NOT NULL,
  event_id BIGINT UNSIGNED NOT NULL,
  scanned_by_user_id BIGINT UNSIGNED NULL,
  scan_result ENUM('accepted', 'duplicate', 'revoked', 'invalid') NOT NULL,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes VARCHAR(255) NULL,
  CONSTRAINT fk_checkin_attendee FOREIGN KEY (attendee_id) REFERENCES attendees(id),
  CONSTRAINT fk_checkin_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_checkin_user FOREIGN KEY (scanned_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attendee_id BIGINT UNSIGNED NOT NULL UNIQUE,
  certificate_number VARCHAR(80) NOT NULL UNIQUE,
  template_key VARCHAR(80) NOT NULL DEFAULT 'default',
  file_url VARCHAR(500) NULL,
  status ENUM('pending', 'issued', 'revoked') NOT NULL DEFAULT 'pending',
  issued_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_certificates_attendee FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_cards (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attendee_id BIGINT UNSIGNED NOT NULL UNIQUE,
  card_number VARCHAR(80) NOT NULL UNIQUE,
  template_key VARCHAR(80) NOT NULL DEFAULT 'default',
  file_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_cards_attendee FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NOT NULL,
  attendee_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(180) NULL,
  comment TEXT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_reviews_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_reviews_attendee FOREIGN KEY (attendee_id) REFERENCES attendees(id),
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS project_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



-- ============================================================================
-- Migration: 002_phase1_annex_workflows.sql
-- ============================================================================



ALTER TABLE events
  ADD COLUMN IF NOT EXISTS banner_image_url VARCHAR(500) NULL AFTER cover_image_url,
  ADD COLUMN IF NOT EXISTS gallery_json JSON NULL AFTER banner_image_url,
  ADD COLUMN IF NOT EXISTS google_maps_url VARCHAR(500) NULL AFTER gallery_json,
  ADD COLUMN IF NOT EXISTS registration_starts_at DATETIME NULL AFTER ends_at,
  ADD COLUMN IF NOT EXISTS registration_ends_at DATETIME NULL AFTER registration_starts_at,
  ADD COLUMN IF NOT EXISTS certificate_template_id BIGINT UNSIGNED NULL AFTER registration_ends_at;

ALTER TABLE ticket_price_periods
  ADD COLUMN IF NOT EXISTS price_egp DECIMAL(10,2) NULL AFTER price,
  ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2) NULL AFTER price_egp;

CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(180) NOT NULL,
  mobile VARCHAR(40) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  address TEXT NULL,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  specialty VARCHAR(180) NOT NULL,
  nationality VARCHAR(120) NOT NULL,
  preferred_language ENUM('ar', 'en') NOT NULL DEFAULT 'en',
  status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(180) NOT NULL,
  bank_name VARCHAR(180) NOT NULL,
  account_number VARCHAR(120) NOT NULL,
  iban VARCHAR(120) NULL,
  swift_code VARCHAR(80) NULL,
  currency CHAR(3) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  registration_number VARCHAR(80) NOT NULL UNIQUE,
  doctor_id BIGINT UNSIGNED NOT NULL,
  event_id BIGINT UNSIGNED NOT NULL,
  ticket_type_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  source ENUM('online', 'manual', 'kiosk') NOT NULL DEFAULT 'online',
  registration_status ENUM('pending_payment', 'pending_verification', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending_payment',
  payment_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  selected_currency CHAR(3) NOT NULL,
  selected_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selected_price_period_id BIGINT UNSIGNED NULL,
  payment_reference VARCHAR(180) NULL,
  payment_proof_url VARCHAR(500) NULL,
  payment_reviewed_by_user_id BIGINT UNSIGNED NULL,
  payment_reviewed_at DATETIME NULL,
  payment_rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_registrations_ticket_type FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),
  CONSTRAINT fk_registrations_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_registrations_price_period FOREIGN KEY (selected_price_period_id) REFERENCES ticket_price_periods(id),
  CONSTRAINT fk_registrations_reviewer FOREIGN KEY (payment_reviewed_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS generated_tickets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  registration_id BIGINT UNSIGNED NOT NULL UNIQUE,
  attendee_id BIGINT UNSIGNED NOT NULL UNIQUE,
  ticket_number VARCHAR(80) NOT NULL UNIQUE,
  qr_token CHAR(64) NOT NULL UNIQUE,
  pdf_url VARCHAR(500) NULL,
  generated_at DATETIME NOT NULL,
  printed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_generated_tickets_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_generated_tickets_attendee FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificate_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  template_type ENUM('image', 'pdf') NOT NULL DEFAULT 'image',
  template_url VARCHAR(500) NOT NULL,
  field_positions_json JSON NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_certificate_templates_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kiosk_search_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NULL,
  search_type ENUM('email', 'mobile', 'registration_number') NOT NULL,
  search_value VARCHAR(180) NOT NULL,
  result_status ENUM('found', 'not_found') NOT NULL,
  matched_registration_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kiosk_search_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_kiosk_search_registration FOREIGN KEY (matched_registration_id) REFERENCES registrations(id)
);


-- ============================================================================
-- Migration: 003_auth_and_operational_hardening.sql
-- ============================================================================


ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(80) NULL UNIQUE AFTER phone,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER preferred_language;

ALTER TABLE events
  MODIFY status ENUM('draft', 'published', 'sold_out', 'completed', 'cancelled', 'disabled', 'deleted') NOT NULL DEFAULT 'draft';

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id VARCHAR(80) NULL,
  metadata_json JSON NULL,
  ip_address VARCHAR(80) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  body TEXT NULL,
  type ENUM('registration', 'payment', 'ticket', 'certificate', 'system') NOT NULL DEFAULT 'system',
  severity ENUM('info', 'success', 'warning', 'danger') NOT NULL DEFAULT 'info',
  target_url VARCHAR(500) NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- Migration: 004_users_permissions.sql
-- ============================================================================


ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(80) NULL UNIQUE AFTER phone,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL AFTER preferred_language,
  ADD COLUMN IF NOT EXISTS notes VARCHAR(500) NULL AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER notes;


CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  allowed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permission (role_id, permission_key),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);


-- ============================================================================
-- Migration: 005_user_profile_fields.sql
-- ============================================================================


ALTER TABLE users
  ADD COLUMN IF NOT EXISTS country_code CHAR(2) NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS country_name VARCHAR(120) NULL AFTER country_code,
  ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'not_specified') NOT NULL DEFAULT 'not_specified' AFTER country_name;

-- ============================================================================
-- Migration: 006_contact_inquiries.sql
-- ============================================================================


CREATE TABLE IF NOT EXISTS contact_inquiries_reference_counter (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_code VARCHAR(40) NOT NULL,
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone_country_code VARCHAR(12) NULL,
  phone_number VARCHAR(40) NULL,
  company VARCHAR(180) NULL,
  inquiry_type ENUM('general','event_planning','technical_support','partnership','existing_booking','other') NOT NULL DEFAULT 'general',
  subject VARCHAR(220) NOT NULL,
  message TEXT NOT NULL,
  preferred_contact_method ENUM('email','phone','whatsapp') NOT NULL DEFAULT 'email',
  event_date DATE NULL,
  event_city VARCHAR(180) NULL,
  expected_attendees INT UNSIGNED NULL,
  status ENUM('new','in_progress','waiting_for_customer','resolved','closed') NOT NULL DEFAULT 'new',
  admin_notes TEXT NULL,
  assigned_to BIGINT UNSIGNED NULL,
  source_page VARCHAR(120) NULL,
  consent_accepted_at TIMESTAMP NULL,
  consent_version VARCHAR(80) NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contact_inquiries_reference_code (reference_code),
  INDEX idx_contact_inquiries_reference_code (reference_code),
  INDEX idx_contact_inquiries_status_created (status, created_at),
  INDEX idx_contact_inquiries_type_created (inquiry_type, created_at),
  INDEX idx_contact_inquiries_created_at (created_at),
  INDEX idx_contact_inquiries_email (email)
);

SET @current_schema = DATABASE();

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE contact_inquiries ADD UNIQUE KEY uq_contact_inquiries_reference_code (reference_code)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @current_schema
    AND TABLE_NAME = 'contact_inquiries'
    AND NON_UNIQUE = 0
    AND COLUMN_NAME = 'reference_code'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE contact_inquiries ADD INDEX idx_contact_inquiries_reference_code (reference_code)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @current_schema
    AND TABLE_NAME = 'contact_inquiries'
    AND INDEX_NAME = 'idx_contact_inquiries_reference_code'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE contact_inquiries ADD INDEX idx_contact_inquiries_status_created (status, created_at)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @current_schema
    AND TABLE_NAME = 'contact_inquiries'
    AND INDEX_NAME = 'idx_contact_inquiries_status_created'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE contact_inquiries ADD INDEX idx_contact_inquiries_type_created (inquiry_type, created_at)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @current_schema
    AND TABLE_NAME = 'contact_inquiries'
    AND INDEX_NAME = 'idx_contact_inquiries_type_created'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE contact_inquiries ADD INDEX idx_contact_inquiries_created_at (created_at)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @current_schema
    AND TABLE_NAME = 'contact_inquiries'
    AND INDEX_NAME = 'idx_contact_inquiries_created_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- Migration: 007_roles_permissions_scope.sql
-- ============================================================================


CREATE TABLE IF NOT EXISTS event_staff_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_staff_assignment (event_id, user_id),
  KEY idx_event_staff_user_active (user_id, is_active),
  CONSTRAINT fk_event_staff_assignments_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_staff_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



-- ============================================================================
-- Migration: 008_public_event_checkout.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public_checkout_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_key VARCHAR(120) NOT NULL UNIQUE,
  payload_hash CHAR(64) NOT NULL,
  event_id BIGINT UNSIGNED NOT NULL,
  ticket_type_id BIGINT UNSIGNED NOT NULL,
  registration_id BIGINT UNSIGNED NULL,
  customer_email VARCHAR(180) NOT NULL,
  status ENUM('pending', 'completed', 'expired') NOT NULL DEFAULT 'pending',
  expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_public_checkout_sessions_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_public_checkout_sessions_ticket FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE,
  CONSTRAINT fk_public_checkout_sessions_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL
);

CREATE INDEX idx_public_checkout_sessions_event_status ON public_checkout_sessions (event_id, status);
CREATE INDEX idx_public_checkout_sessions_email ON public_checkout_sessions (customer_email);
CREATE INDEX idx_registrations_event_ticket_status ON registrations (event_id, ticket_type_id, registration_status);
CREATE INDEX idx_registrations_created_at ON registrations (created_at);
CREATE INDEX idx_ticket_price_periods_public_lookup ON ticket_price_periods (ticket_type_id, is_active, starts_at, ends_at);

-- ============================================================================
-- Migration: 009_public_checkout_confirmation_security.sql
-- ============================================================================

ALTER TABLE public_checkout_sessions
  ADD COLUMN IF NOT EXISTS confirmation_token_hash CHAR(64) NULL AFTER payload_hash,
  ADD COLUMN IF NOT EXISTS confirmation_token_expires_at DATETIME NULL AFTER confirmation_token_hash,
  ADD COLUMN IF NOT EXISTS confirmed_at DATETIME NULL AFTER confirmation_token_expires_at;

CREATE INDEX idx_public_checkout_sessions_confirmation ON public_checkout_sessions (registration_id, confirmation_token_expires_at);

-- ============================================================================
-- Migration: 010_capacity_reservation_expiry.sql
-- ============================================================================

ALTER TABLE orders
  MODIFY status ENUM('draft', 'pending_payment', 'paid', 'cancelled', 'refunded', 'expired') NOT NULL DEFAULT 'pending_payment';

ALTER TABLE registrations
  MODIFY registration_status ENUM('pending_payment', 'pending_verification', 'approved', 'rejected', 'cancelled', 'expired') NOT NULL DEFAULT 'pending_payment',
  MODIFY payment_status ENUM('pending', 'approved', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reservation_expires_at DATETIME NULL AFTER payment_proof_url,
  ADD COLUMN IF NOT EXISTS capacity_reservation_status ENUM('none', 'active', 'released', 'expired') NOT NULL DEFAULT 'active' AFTER reservation_expires_at,
  ADD COLUMN IF NOT EXISTS capacity_released_at DATETIME NULL AFTER capacity_reservation_status,
  ADD COLUMN IF NOT EXISTS capacity_release_reason VARCHAR(120) NULL AFTER capacity_released_at;


CREATE INDEX idx_registrations_capacity_expiry ON registrations (capacity_reservation_status, reservation_expires_at);
CREATE INDEX idx_registrations_capacity_lookup ON registrations (event_id, ticket_type_id, capacity_reservation_status, registration_status);

-- ============================================================================
-- Migration: 011_event_registration_policy.sql
-- ============================================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS public_registration_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER registration_ends_at,
  ADD COLUMN IF NOT EXISTS registration_approval_mode ENUM('automatic', 'manual_review') NOT NULL DEFAULT 'automatic' AFTER public_registration_enabled,
  ADD COLUMN IF NOT EXISTS registration_access ENUM('guest_allowed', 'login_required') NOT NULL DEFAULT 'guest_allowed' AFTER registration_approval_mode,
  ADD COLUMN IF NOT EXISTS max_tickets_per_checkout INT UNSIGNED NOT NULL DEFAULT 1 AFTER registration_access,
  ADD COLUMN IF NOT EXISTS capacity_hold_hours_override INT UNSIGNED NULL AFTER max_tickets_per_checkout,
  ADD COLUMN IF NOT EXISTS manual_payment_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER capacity_hold_hours_override;

ALTER TABLE registrations
  MODIFY registration_status ENUM('pending_payment', 'pending_verification', 'pending_review', 'approved', 'rejected', 'cancelled', 'expired') NOT NULL DEFAULT 'pending_payment';


CREATE INDEX idx_events_public_registration_window ON events (public_registration_enabled, registration_starts_at, registration_ends_at);
CREATE INDEX idx_events_registration_policy ON events (registration_approval_mode, registration_access);

-- ============================================================================
-- Migration: 012_event_details_image_reviews.sql
-- ============================================================================


ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_details_image_url VARCHAR(500) NULL AFTER banner_image_url;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;


CREATE INDEX idx_reviews_public_event_status ON reviews (event_id, status, created_at);
CREATE INDEX idx_reviews_customer_event ON reviews (customer_id, event_id);
CREATE UNIQUE INDEX uq_reviews_customer_event ON reviews (customer_id, event_id);


