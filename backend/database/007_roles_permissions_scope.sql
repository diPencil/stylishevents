USE directevents_platform;

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

INSERT IGNORE INTO role_permissions (role_id, permission_key, allowed)
SELECT r.id, p.permission_key, p.allowed
FROM roles r
JOIN (
  SELECT 'admin' AS role_code, 'contact_inquiries.manage' AS permission_key, 1 AS allowed UNION ALL
  SELECT 'admin', 'website_content.manage', 1 UNION ALL
  SELECT 'admin', 'theme_identity.manage', 1 UNION ALL
  SELECT 'admin', 'certificates.view', 1 UNION ALL
  SELECT 'admin', 'reviews.view', 1 UNION ALL
  SELECT 'organizer', 'certificates.view', 1 UNION ALL
  SELECT 'organizer', 'reviews.view', 1 UNION ALL
  SELECT 'back_office', 'contact_inquiries.manage', 1 UNION ALL
  SELECT 'back_office', 'certificates.view', 1 UNION ALL
  SELECT 'back_office', 'reviews.view', 1 UNION ALL
  SELECT 'employee', 'certificates.manage', 0
) p ON p.role_code = r.code;

UPDATE role_permissions rp
JOIN roles r ON r.id = rp.role_id
SET rp.allowed = 0
WHERE r.code = 'employee'
  AND rp.permission_key IN ('certificates.view', 'certificates.manage', 'reviews.view', 'reviews.manage');
