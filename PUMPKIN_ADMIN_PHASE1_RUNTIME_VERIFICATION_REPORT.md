# Pumpkin Admin Phase 1 Runtime Verification Report

## Summary

Phase 1 admin read-only page manager was runtime-verified against the local Pumpkin API, Cosmos Emulator, admin app, and public frontend.

Result: the admin page manager works at runtime after the local Cosmos Emulator has an active admin `User` document. The initial blocker was that the local `User` container was empty, so `/api/auth/login` could not succeed. A local-only SuperAdmin user record was upserted into the Cosmos Emulator to unblock verification. No source code, `.env.local`, `appsettings.Development.json`, production data, editing features, import/export features, archive, or delete behavior was changed.

## Local Targets

- Pumpkin API: `http://localhost:5064`
- Admin app: `http://localhost:3001`
- Public frontend: `http://localhost:3002`
- Tenants verified:
  - `ice-rink-rentals`
  - `roller-rink-rentals`

## Credentials And Seed Requirements

The local admin login requires an active document in the Cosmos `User` container with:

- tenant-scoped partition key
- email
- username
- BCrypt password hash
- active status
- admin-capable role/permissions

Initial state:

- `Tenant` container had local tenant data.
- `Page` container had local page data.
- `Theme` container had local theme data.
- `User` container had `0` documents.

Runtime unblocker applied:

- Inserted/upserted one local-only SuperAdmin `User` document in Cosmos Emulator.
- Used the repo's existing local admin credential pattern.
- Did not write the email/password/hash into this report or source code.
- Did not modify production data.

## Auth Flow Result

`POST /api/auth/login`:

- Worked after the local `User` document was present.
- Returned a JWT and user info.
- User role resolved as `SuperAdmin`.
- User tenant resolved as `ice-rink-rentals`.

JWT persistence:

- Browser login set `pumpkin_auth_token`.
- Browser login set `pumpkin_user`.
- Browser login set `pumpkin_current_tenant`.
- Navigation to `/dashboard/pages` and read-only detail routes worked after login.

Missing auth endpoints:

- `GET /api/auth/verify` returned `404`.
- `POST /api/auth/logout` returned `404`.
- These do not block the page manager because the current `AuthContext` catches verify/logout failures and proceeds/clears local storage as needed.
- They do create console noise and should be resolved in the next cleanup pass.

## Tenant Selection Result

`GET /api/admin/tenants` worked with the JWT.

Returned local tenants:

- `ice-rink-rentals`
- `roller-rink-rentals`
- `second-product-rentals`

Admin UI tenant selector:

- Defaulted to `ice-rink-rentals` after login.
- Successfully switched to `roller-rink-rentals`.
- Persisted the selected tenant in `pumpkin_current_tenant`.

## Page List Result

API verification:

- `GET /api/admin/pages?tenantId=ice-rink-rentals`
  - Returned 4 pages.
  - Slugs included `home`, `contact`, `events-holiday-activations`, `ice-rink-rentals`.

- `GET /api/admin/pages?tenantId=roller-rink-rentals`
  - Returned 3 pages.
  - Slugs included `roller-rink-rentals`, `home`, `contact`.

Admin UI verification:

- `/dashboard/pages` loaded the Ice Rink page table.
- The Ice list showed home, contact, and service page slugs.
- Switching the tenant selector loaded the Roller Rink page table.
- The Roller list showed home, contact, and service page slugs.

## Page Detail Result

API detail verification:

- Ice detail loaded through `GET /api/admin/pages/ice-rink-rentals/home`.
- Roller detail loaded through `GET /api/admin/pages/roller-rink-rentals/roller-rink-rentals`.
- Returned page data included title, published status, sitemap flag, and content blocks.

Admin UI detail verification:

- `/dashboard/pages/home/view?tenantId=ice-rink-rentals`
  - Loaded successfully.
  - Showed SEO section.
  - Showed Content Blocks section.
  - Showed Preview link.

- `/dashboard/pages/roller-rink-rentals/view?tenantId=roller-rink-rentals`
  - Loaded successfully.
  - Showed SEO section.
  - Showed Content Blocks section.
  - Showed Preview link.

## Preview Link Result

Admin page list generated the expected preview links.

Ice Rink:

- `http://localhost:3002/`
- `http://localhost:3002/contact`
- `http://localhost:3002/events-holiday-activations`
- `http://localhost:3002/ice-rink-rentals`

Roller Rink:

- `http://roller.localhost:3002/`
- `http://roller.localhost:3002/contact`
- `http://roller.localhost:3002/roller-rink-rentals`

Public route checks:

- Ice Rink direct URLs returned `200`.
- Roller Rink URLs returned `200` in Chrome.
- PowerShell did not resolve `roller.localhost`, but the same routes returned `200` when requested through `127.0.0.1:3002` with `Host: roller.localhost:3002`.

## Files Changed

Source files changed:

- None.

Runtime/local data changed:

- One local-only `User` document was upserted into Cosmos Emulator to enable admin login verification.

Report added:

- `PUMPKIN_ADMIN_PHASE1_RUNTIME_VERIFICATION_REPORT.md`

## Checks Run

- Verified listening targets:
  - API on `5064`
  - Admin on `3001`
  - Frontend on `3002`

- Direct API checks:
  - Login before user seed: failed with `401`.
  - Login after local user seed: passed.
  - JWT tenants endpoint: passed.
  - JWT page list endpoints for both tenants: passed.
  - JWT page detail endpoints for both tenants: passed.
  - Verify/logout endpoints: returned `404`.

- Browser checks using local Chrome + temporary Playwright runtime:
  - Admin login: passed.
  - JWT/localStorage persistence: passed.
  - Tenant selector: passed.
  - Ice page list: passed.
  - Ice page detail: passed.
  - Roller page list: passed.
  - Roller page detail: passed.
  - Preview hrefs: passed.

- Public frontend checks:
  - Ice routes returned `200`.
  - Roller routes returned `200` in Chrome.
  - Roller host-header requests returned `200`.

- Targeted lint:
  - `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/[id]/view/page.tsx" "src/lib/api.ts"`
  - Passed.

## Blockers

Resolved runtime blocker:

- The local `User` container was empty, so admin login could not work until a local-only admin user was seeded.

Remaining non-blocking issues:

- `/api/auth/verify` is missing.
- `/api/auth/logout` is missing.
- Full admin lint/type/build checks still have unrelated legacy blockers documented in the Phase 1 report.
- The legacy `second-product-rentals` tenant is still present locally, though Roller Rink is the confirmed second-site tenant.

## Next Recommended Phase

Proceed with Phase 1.5 cleanup before adding editing/import/export/static publishing:

- Add or remove/disable the missing verify/logout calls so auth has no avoidable runtime 404s.
- Add a safe local admin-user seed path or documented local-only user seed requirement.
- Keep the page manager read-only.
- Keep destructive actions, import/export, and static export out of scope until the structured editor and publish safety model are ready.
