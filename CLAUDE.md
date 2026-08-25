# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint (flat invocation — `next lint` was removed in Next 16)
npm run format       # Prettier format (targets app/ only)
npm run test         # Run the Vitest unit-test suite once
npm run test:watch   # Run Vitest in watch mode
npm run test:db      # Run the DB-backed API test suite (needs local Postgres, see Testing)
npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply pending migrations to the database
npm run db:studio    # Open Drizzle Studio GUI for the database
npm run db:seed      # Seed a default profile + sample data (needs DATABASE_URL in .env.local)

docker compose up -d --build   # Run the full stack locally: Postgres, ntfy, app, cron sidecar
```

## Testing

Unit tests (Vitest) cover pure business-logic functions — recurrence date math
(`getNextDueDate`, `getNextMaintenanceDueDate`), habit streak calculation
(`computeStreaks`, `isHabitDueToday`), the utility-usage anomaly detector
(`withAnomalyFlags`), the open-redirect guard (`safeRedirectPath`), and the
field-encryption round-trip. Tests are colocated as `*.test.ts` next to the
module they cover and run against plain Node — no database or Next.js runtime
required, so they're fast and safe to run on every change.

DB-backed API tests (`npm run test:db`) exercise the Hono route handlers
directly against a real local Postgres database — no HTTP server, just
`app.request()` against each router's default export. They're the layer
that verifies auth and row-level access control end to end (e.g. that
`GET /api/accounts/:id` 404s rather than leaks when a different profile
requests it, via `canUserSeeAccount`/`canUserSeeTransaction` in
`app/api/utils/`), which the unit layer can't reach since it never touches
the database. Config lives in `vitest.config.db.mts`; connection details
are in `tests/db-test-env.ts` (a throwaway local `milo_test` database, not
a secret). `tests/db-global-setup.ts` applies Drizzle migrations to it once
before the run, and each test's `beforeEach` calls `resetDb()`
(`tests/db-test-helpers.ts`) to truncate all tables so tests don't leak
state into each other. Requires a local Postgres reachable at
`postgres://postgres:devpass@localhost:5432` with a `milo_test` database
already created (`createdb milo_test` or the equivalent `CREATE DATABASE`).
Tests are colocated as `*.dbtest.ts` next to the route file they cover —
a different suffix from the unit layer's `*.test.ts` so `npm run test` and
`npm run test:db` never pick up each other's files.

There is no browser-driven E2E suite yet.

## Architecture

**My Life Organizer** is a self-hosted personal/family organizer built on Next.js 14 App Router. It runs entirely on local infrastructure — no cloud auth, database, storage, or email provider — intended for a home server (e.g. a Docker Compose stack on a home Ubuntu box).

A cloud/multi-tenant variant (Clerk auth, Neon Postgres, UploadThing, Resend) is preserved on the `cloud-saas` branch for a future scenario where the app needs to be served to multiple unrelated households; `main` is local-only going forward.

### API Layer (Hono)

All backend logic lives in `app/api/[[...route]]/`. The entry point is `route.ts`, which assembles a Hono app from sub-routers (`accounts.ts`, `transactions.ts`, `categories.ts`, `budgets.ts`, `summary.ts`, `profiles.ts`, etc). The Hono app is exported as `AppType` and consumed by a typed client in `lib/hono.ts` — all frontend API calls go through this typed client, never raw `fetch`.

API routes use `@hono/zod-validator` for request validation and run on the Node.js runtime (not edge — required for the `pg` Postgres driver). Authorization utilities in `app/api/utils/` implement row-level access checks (e.g. `can-user-see-account`), scoping queries to the active local profile's `userId`.

### Feature Modules

`features/` is organized by domain: `accounts`, `budgets`, `categories`, `transactions`, `summary`, `events`, `tasks`, `shopping`, `documents`, `habits`, `profiles`. Each feature follows this structure:

- `api/` — React Query hooks (e.g. `use-get-accounts.ts`, `use-create-account.ts`)
- `components/` — Forms and slide-over sheets for that domain
- `hooks/` — Feature-specific UI state (e.g. open/close state for the new-account sheet)

### Data Layer

`db/schema.ts` defines all Drizzle tables: `accounts`, `transactions`, `categories`, `budgets`, `profiles`, etc. Drizzle schemas are used directly to derive Zod validation schemas for API routes. The database is plain Postgres (run via `docker-compose.yml`'s `postgres` service), configured in `db/drizzle.ts` via `drizzle-orm/node-postgres`.

### Authentication & Identity

Two layers, both cookie-based, no accounts:

1. **Site gate** (`lib/site-auth.ts`) — a single shared `APP_PASSWORD` protects the whole app from anything on the network. `middleware.ts` requires a `milo_site_auth` cookie (an HMAC of a fixed string keyed by `APP_PASSWORD`, verified without server-side session storage) and redirects to `/site-login` if it's missing or invalid. **Required** — if `APP_PASSWORD` isn't set, every request is rejected.
2. **Profile picker** (`lib/local-auth.ts`) — once past the site gate, `middleware.ts` requires a `milo_profile_id` cookie and redirects to `/select-profile` if it's missing: a lightweight "who's using this" picker (like Netflix profiles) so each family member's data stays separate, backed by the `profiles` table. `getAuth(c)` (Hono routes) and `getServerAuth()` (Next.js route handlers) return `{ userId }` from that cookie, mirroring the shape the old Clerk helpers used so route handlers barely changed.

`hooks/use-organization-query-invalidation.ts` invalidates all React Query cache entries when the active profile changes.

### Notifications

Reminders (upcoming events, expiring documents, habit nudges) are pushed via a self-hosted [ntfy](https://ntfy.sh) server (the `ntfy` service in `docker-compose.yml`) rather than email. Each profile can set a personal ntfy topic in Settings; `app/api/notifications/process/route.ts` is polled every 15 minutes by the `cron` sidecar container and pushes to each profile's topic.

### File Storage

Uploaded documents are written to local disk (`lib/local-storage.ts`, under `UPLOADS_DIR`, mounted as a Docker volume) rather than a cloud object store. `app/api/documents/upload/route.ts` accepts the upload and `app/api/documents/file/[key]/route.ts` serves it back, both auth-gated by the active profile.

### Providers

`providers/providers.tsx` composes all root providers: React Query, next-themes, sheet modals, and custom theme colors. Add new global providers here.

## Field-level Encryption

Sensitive columns (`accounts.holder`, `accounts.number`, `transactions.payee`, `transactions.description`) are encrypted at rest using AES-256-GCM via the Web Crypto API (`lib/encryption.ts`).

**Required env var:**
```
ENCRYPTION_KEY=<64 hex characters>
```
Generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Values are stored with an `enc:` prefix. Rows written before encryption was enabled are returned as-is (plaintext fallback), so the migration is rolling and non-breaking.

## Key Conventions

- **Path alias**: `@/*` maps to the repo root. Always use this for imports.
- **Styling**: Tailwind CSS with dark mode via the `class` strategy. Custom chart color tokens are defined in `lib/theme-colors.ts`.
- **Forms**: React Hook Form + Zod. Use `zod.infer<typeof schema>` for form types. Custom form inputs live in `components/`.
- **Toasts**: Use `sonner` (`toast.success`, `toast.error`) — not any other toast library.
- **Modals/Sheets**: Slide-over sheets are managed via Zustand stores in each feature's `hooks/` folder and registered in `providers/sheet-provider.tsx`.
- **Prettier config**: Double quotes, semicolons on, 3-tier import sorting (builtins → external → internal). Run `npm run format` before committing — note it only targets `app/`, not the full repo.
- **TypeScript**: Strict mode enabled. No `any` casts without justification.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
