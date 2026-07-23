USE directevents_platform;

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

INSERT IGNORE INTO project_settings (setting_key, setting_value) VALUES
  ('payment_rules', JSON_OBJECT(
    'egyptCurrency', 'EGP',
    'internationalCurrency', 'USD',
    'phaseOnePaymentMethod', 'bank_transfer'
  ));
