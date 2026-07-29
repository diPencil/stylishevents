# Stylish Events Platform Database

This folder contains the first MySQL schema for the expanded events platform.

## XAMPP setup

1. Start Apache and MySQL from XAMPP.
2. Open phpMyAdmin.
3. Import `001_events_platform_schema.sql`.
4. Import `002_phase1_annex_workflows.sql`.
5. Import `003_auth_and_operational_hardening.sql`.
6. Import `004_users_permissions.sql`.
7. Import `005_user_profile_fields.sql`.
8. Import `006_contact_inquiries.sql`.
9. Add these values to `backend/.env.local`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=directevents_platform
```

The schema is designed for:

- Admin, organizer, employee, and customer users.
- Events, venues, sessions, ticket types, and timed ticket price periods.
- Orders and attendees.
- QR check-in logs.
- Certificates and event cards.
- Reviews.
- Project theme settings controlled from the admin dashboard.

## Phase 1 Annex workflow additions

`002_phase1_annex_workflows.sql` adds the production workflow required by the Technical Annex:

- Doctor profiles with country, city, specialty, and nationality.
- Online/manual registrations.
- EGP pricing for Egypt and USD pricing for every other country.
- Bank transfer account records.
- Payment verification statuses: pending, approved, rejected.
- Generated tickets after payment approval.
- Certificate templates per event.
- Kiosk search logs for email, mobile, or registration number lookup.

`003_auth_and_operational_hardening.sql` adds:

- Usernames and last-login tracking.
- Audit logs.
- Admin notifications.
- Expanded event statuses for disabled and deleted states.
- Stored payment rules for Egypt EGP and international USD pricing.

`004_users_permissions.sql` adds:

- Back Office and Doctor roles.
- Avatar and notes fields for users.
- Role permissions for admin, organizer, back office, employee, doctor, and customer accounts.

`006_contact_inquiries.sql` adds:

- Public Contact Inquiry storage.
- Unique reference codes.
- Consent timestamp and version storage.
- Admin listing indexes for reference, status, inquiry type, and creation date.
