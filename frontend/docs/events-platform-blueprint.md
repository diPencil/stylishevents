# DirectEvents Platform Blueprint

## Direction

Keep the current stack:

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- Backend: Node.js, Express, JavaScript.
- Database: MySQL through XAMPP in development.

The existing marketing website remains in place. The new platform grows beside it through `/admin`, future organizer dashboards, and future customer dashboards.

## Roles

- Admin: controls the full platform, theme, users, events, tickets, bookings, reports, and reviews.
- Organizer: manages assigned events and operational data.
- Employee: scans QR codes, checks attendees in, and supports on-site workflows.
- Customer: manages tickets, QR codes, event cards, certificates, and reviews.

## Core Modules

- Auth and role-based access.
- Events and venues.
- Event sessions and schedules.
- Ticket types.
- Ticket pricing periods.
- Orders and payments.
- Attendees.
- QR codes and check-in logs.
- Certificates.
- Event cards and badges.
- Reviews and moderation.
- Notifications and emails.
- Reports.
- Project settings and theme control.

## Responsive Rules

Every new dashboard screen must support:

- Mobile: 360px and 390px.
- Tablet: 768px.
- Laptop: 1024px.
- Desktop: 1440px and above.

Tables should become horizontal-scroll tables or card lists on mobile. Sidebars should become drawers. Primary actions must stay reachable on touch screens.

## Language Rules

Every new screen must support:

- Arabic with RTL layout.
- English with LTR layout.

No new visible strings should be hardcoded directly in complex screens. Use translation helpers or localized module copy.

## Implementation Phases

1. Platform foundation:
   - MySQL schema.
   - Admin shell.
   - Theme settings.
   - Events CRUD.

2. Commercial workflow:
   - Ticket types.
   - Pricing periods.
   - Orders.
   - Customer checkout.

3. Attendance workflow:
   - Attendees.
   - QR generation.
   - QR scan/check-in.
   - Duplicate/revoked ticket handling.

4. Post-event workflow:
   - Event cards.
   - Certificates.
   - Reviews.
   - Email notifications.

5. Reporting:
   - Revenue reports.
   - Attendance reports.
   - Ticket performance.
   - Event satisfaction metrics.
