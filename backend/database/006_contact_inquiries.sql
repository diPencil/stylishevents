USE directevents_platform;

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
