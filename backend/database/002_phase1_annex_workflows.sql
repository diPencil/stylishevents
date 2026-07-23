USE directevents_platform;

INSERT IGNORE INTO roles (code, name_en, name_ar) VALUES
  ('doctor', 'Doctor', 'Doctor');

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

INSERT IGNORE INTO bank_accounts (
  account_name,
  bank_name,
  account_number,
  iban,
  swift_code,
  currency,
  is_active
) VALUES
  ('Stylish Events EGP Account', 'Bank Transfer', 'EGP-ACCOUNT-NUMBER', NULL, NULL, 'EGP', TRUE),
  ('Stylish Events USD Account', 'Bank Transfer', 'USD-ACCOUNT-NUMBER', NULL, NULL, 'USD', TRUE);
