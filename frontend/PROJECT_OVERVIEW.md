# Project Overview

This document summarizes the backend and frontend structure for the Events/EventSystem workspace.

---

## Backend

High-level: Node.js backend (see `backend/package.json`). Main responsibilities: API, DB migrations, seeding, templates, and file uploads.

- **Root files**
  - `backend/package.json`: npm metadata and scripts.
  - `backend/README.md`: backend-specific documentation.
  - `backend/test.js`: small test script.
  - `backend/vercel.json`: deployment config for Vercel.

- **Database** (`backend/database/`)
  - Migration and schema files:
    - `001_events_platform_schema.sql`
    - `002_phase1_annex_workflows.sql`
    - `003_auth_and_operational_hardening.sql`
    - `004_users_permissions.sql`
    - `005_user_profile_fields.sql`
  - `backend/database/README.md` for DB notes.

- **Scripts** (`backend/scripts/`)
  - `seed-production-data.js`: data seeding for production or staging.

- **Source** (`backend/src/`)
  - `server.js`: application entrypoint / HTTP server.
  - `config/`: configuration (env, constants).
  - `db/`: database connection and helpers.
  - `middleware/`: Express (or similar) middleware for auth, logging, etc.
  - `routes/`: route definitions and API endpoints.
  - `services/`: business logic and integrations.
  - `templates/`: email or HTML templates.
  - `utils/`: helper utilities.

- **Static / uploads**
  - `backend/uploads/`: user/content uploads.
  - `backend/assets/`, `backend/avatars/`: static assets and avatars.

Notes:
- Look at `backend/server.js` to find how routes and middleware are wired.
- Database migration files live in `backend/database/` and represent schema history.

---

## Frontend

High-level: Next.js app (app directory with server+client components), TailwindCSS, TypeScript config present.

- **Root files**
  - `frontend/package.json`: npm metadata and scripts.
  - `frontend/SETUP.md`: local setup instructions.
  - `frontend/next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`.
  - `frontend/components.json`: component registry or metadata.

- **App directory** (`frontend/app/`)
  - Core layout and pages:
    - `layout.tsx`, `globals.css`, `dashboard-layout.tsx`, `page.tsx`.
  - Feature pages and routes: `about/`, `admin/`, `analytics/`, `booking-details/`, `customer/`, `dashboard/`, `employee/`, `features/`, `login/`, `register/`, `signup/`, `organizer/`, `upcoming-events/`, etc.
  - Special files: `robots.ts`, `sitemap.ts`.

- **Components** (`frontend/components/`)
  - Reusable UI components: `navbar.tsx`, `footer.tsx`, `event-card.tsx`, `booking-form.tsx`, `metric-card.tsx`, `theme-provider.tsx`, `sidebar.tsx`, `success-modal.tsx`, etc.
  - Organized subfolders: `admin/`, `auth/`, `onboarding/`, `portal/`, `public/`, `ui/`.

- **Contexts & Hooks**
  - `frontend/contexts/`: e.g. `language-context.tsx`, `onboarding-context.tsx`.
  - `frontend/hooks/`: custom React hooks (not fully listed here).

- **Lib, Public, Styles**
  - `frontend/lib/`: shared client-side utilities.
  - `frontend/public/`: static public files served by Next.js.
  - `frontend/styles/`: global or component styles.

- **Types**
  - `frontend/types/`: TypeScript type declarations used across the app.

Notes:
- The app uses the Next.js `app/` router and likely a mix of server and client components.
- Many UI components are optimized for the platform; review `frontend/components/` for design patterns.

---

## Repository-level files and utilities

- `design-system/`: design documentation and shared UI guidelines (`directevents-platform/`).
- `docs/`: project documentation and production plan.
- `runtime-logs/technical-annex-extract.txt`: run logs / extracted notes.
- `scripts/start-local.ps1`: helper script to start services locally on Windows.

---

## How to use this overview

- Entry points:
  - Backend: inspect `backend/server.js` and `backend/package.json` scripts.
  - Frontend: inspect `frontend/package.json` and `frontend/app/page.tsx`.
- To extend this file: add short notes under each section for any new folders or major files.

---

If you want this translated to Arabic (Egyptian dialect) or expanded with run / build commands, tell me and I will update the file accordingly.
