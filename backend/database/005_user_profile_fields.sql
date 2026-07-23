USE directevents_platform;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS country_code CHAR(2) NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS country_name VARCHAR(120) NULL AFTER country_code,
  ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'not_specified') NOT NULL DEFAULT 'not_specified' AFTER country_name;
