# Technical Annex Production Plan

## Confirmed Direction

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- Backend: Node.js, Express.
- Database: MySQL locally through XAMPP and in production through Hostinger MySQL.
- Languages: Arabic and English.
- Phase 1 payment method: bank transfer only.
- Currency rule:
  - Egypt/Egyptian participants pay in EGP.
  - All other countries, including GCC and international participants, pay in USD.

## Implemented Foundation

- `001_events_platform_schema.sql`: base event platform schema.
- `002_phase1_annex_workflows.sql`: Technical Annex workflow additions.
- Doctor profiles.
- Online/manual registration records.
- Bank transfer account records.
- Payment verification state.
- Generated ticket records after approval.
- Certificate templates per event.
- Kiosk search logs.
- Backend routes:
  - `/api/doctors`
  - `/api/registrations`
  - `/api/registrations/:id/payment-proof`
  - `/api/registrations/:id/payment-review`

## Next Production Work

1. Auth and permissions.
   - Admin, Back Office, Doctor, and Kiosk users.
   - Secure sessions or JWT.
   - Route-level permissions.

2. Event management API completion.
   - Full create/edit/delete/status endpoints.
   - Venue, banner, image, gallery, Google Maps link, registration period, and certificate template linking.

3. Dynamic pricing.
   - Ticket periods with EGP and USD prices.
   - Country-based pricing at registration time.
   - Store final order price and currency permanently.

4. Registration workflow.
   - Public event registration form.
   - Manual Back Office registration.
   - Bank details shown after registration.
   - Payment proof upload URL.
   - Approve/reject workflow.
   - Automatic ticket generation after approval.

5. Ticket and QR output.
   - Ticket PDF generation.
   - QR code image/PDF embedding.
   - Download and print actions.
   - Kiosk print flow.

6. Certificate workflow.
   - Per-event certificate templates.
   - PDF/image template upload.
   - Fixed field positions for doctor name, event name, date, and certificate number.
   - Generate, download, print, and resend.

7. Reports.
   - Registration report.
   - Payment status report.
   - Revenue report split by EGP/USD.
   - Nationality report.
   - Specialty report.
   - Certificate report.

8. Deployment readiness.
   - Hostinger environment variables.
   - Remove secrets from documentation.
   - Production CORS.
   - Database migration/import checklist.
   - Build verification.
