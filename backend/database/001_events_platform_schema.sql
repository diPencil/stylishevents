CREATE DATABASE IF NOT EXISTS directevents_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE directevents_platform;

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

INSERT IGNORE INTO roles (code, name_en, name_ar) VALUES
  ('admin', 'Admin', 'مدير النظام'),
  ('organizer', 'Organizer', 'منظم'),
  ('employee', 'Employee', 'موظف'),
  ('customer', 'Customer', 'عميل');

INSERT IGNORE INTO project_settings (setting_key, setting_value) VALUES
  ('theme', JSON_OBJECT(
    'primaryColor', '#EA580C',
    'secondaryColor', '#0f172a',
    'accentColor', '#2563EB',
    'radius', '12',
    'fontFamily', 'Rubik',
    'buttonStyle', 'solid',
    'density', 'comfortable',
    'logoEnUrl', '/logo.png',
    'logoArUrl', '/LogoAR.png',
    'faviconUrl', '/favicon.png'
  ));
