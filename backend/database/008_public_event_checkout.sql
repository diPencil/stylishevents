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
