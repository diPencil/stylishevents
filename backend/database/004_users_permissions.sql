USE directevents_platform;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(80) NULL UNIQUE AFTER phone,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL AFTER preferred_language,
  ADD COLUMN IF NOT EXISTS notes VARCHAR(500) NULL AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER notes;

INSERT IGNORE INTO roles (code, name_en, name_ar) VALUES
  ('back_office', 'Back Office', 'Back Office'),
  ('doctor', 'Doctor', 'Doctor');

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

INSERT IGNORE INTO role_permissions (role_id, permission_key, allowed)
SELECT r.id, p.permission_key, p.allowed
FROM roles r
JOIN (
  SELECT 'admin' AS role_code, 'dashboard.view' AS permission_key, 1 AS allowed UNION ALL
  SELECT 'admin', 'users.manage', 1 UNION ALL
  SELECT 'admin', 'roles.manage', 1 UNION ALL
  SELECT 'admin', 'events.manage', 1 UNION ALL
  SELECT 'admin', 'tickets.manage', 1 UNION ALL
  SELECT 'admin', 'pricing.manage', 1 UNION ALL
  SELECT 'admin', 'registrations.manage', 1 UNION ALL
  SELECT 'admin', 'payments.verify', 1 UNION ALL
  SELECT 'admin', 'attendees.manage', 1 UNION ALL
  SELECT 'admin', 'checkin.manage', 1 UNION ALL
  SELECT 'admin', 'certificates.manage', 1 UNION ALL
  SELECT 'admin', 'reviews.manage', 1 UNION ALL
  SELECT 'admin', 'reports.view', 1 UNION ALL
  SELECT 'admin', 'settings.manage', 1 UNION ALL
  SELECT 'admin', 'kiosk.use', 1 UNION ALL
  SELECT 'admin', 'profile.manage', 1 UNION ALL
  SELECT 'organizer', 'dashboard.view', 1 UNION ALL
  SELECT 'organizer', 'events.manage', 1 UNION ALL
  SELECT 'organizer', 'tickets.manage', 1 UNION ALL
  SELECT 'organizer', 'pricing.manage', 1 UNION ALL
  SELECT 'organizer', 'registrations.manage', 1 UNION ALL
  SELECT 'organizer', 'attendees.manage', 1 UNION ALL
  SELECT 'organizer', 'checkin.manage', 1 UNION ALL
  SELECT 'organizer', 'certificates.manage', 1 UNION ALL
  SELECT 'organizer', 'reviews.manage', 1 UNION ALL
  SELECT 'organizer', 'reports.view', 1 UNION ALL
  SELECT 'organizer', 'profile.manage', 1 UNION ALL
  SELECT 'back_office', 'dashboard.view', 1 UNION ALL
  SELECT 'back_office', 'registrations.manage', 1 UNION ALL
  SELECT 'back_office', 'payments.verify', 1 UNION ALL
  SELECT 'back_office', 'attendees.manage', 1 UNION ALL
  SELECT 'back_office', 'checkin.manage', 1 UNION ALL
  SELECT 'back_office', 'certificates.manage', 1 UNION ALL
  SELECT 'back_office', 'reports.view', 1 UNION ALL
  SELECT 'back_office', 'profile.manage', 1 UNION ALL
  SELECT 'employee', 'dashboard.view', 1 UNION ALL
  SELECT 'employee', 'attendees.manage', 1 UNION ALL
  SELECT 'employee', 'checkin.manage', 1 UNION ALL
  SELECT 'employee', 'certificates.manage', 1 UNION ALL
  SELECT 'employee', 'profile.manage', 1 UNION ALL
  SELECT 'doctor', 'profile.manage', 1 UNION ALL
  SELECT 'customer', 'profile.manage', 1
) p ON p.role_code = r.code;
