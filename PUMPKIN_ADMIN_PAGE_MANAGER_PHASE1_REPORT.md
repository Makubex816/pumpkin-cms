# Pumpkin Admin Page Manager Phase 1 Report

## Summary

Phase 1 adds a safe, read-only admin page manager foundation for the Pumpkin CMS multi-site rental-site engine.

The admin now has a clearer tenant-scoped page list and a read-only page detail view that can inspect page metadata, SEO, image-related fields, content blocks, search data, and content relationships without exposing create/update/delete/publish/import/export controls.

No source code was changed outside `apps/admin`. No `.env.local`, `appsettings.Development.json`, production data, API keys, passwords, hashes, connection strings, or secrets were modified or documented.

## Files Changed

- `apps/admin/src/lib/api.ts`
  - Removed browser-side API key header usage from the admin API client.
  - Removed API-key preview logging.
  - Kept admin calls on JWT bearer auth.
  - Changed model imports to type-only imports.
  - Switched page read from client-side list filtering to the direct admin page read endpoint.
  - URL-encoded tenant IDs and page slugs for page list/read calls.

- `apps/admin/src/app/dashboard/pages/page.tsx`
  - Reworked the page list into a Phase 1 read-only page manager.
  - Removed the visible "New Page" action from this screen.
  - Added tenant context display.
  - Added published status, sitemap status, updated date, view action, and local preview links.
  - Added explicit missing-auth, missing-tenant, API-error, loading, and empty-list states.

- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
  - Added a new read-only page detail route.
  - Shows page summary fields, SEO fields, image field signals, structured content blocks, search data, and content relationships.
  - Labels missing values, empty lists/objects, unsupported values, and unsupported block types.
  - Provides a public preview link.
  - Provides no save, publish, archive, import, export, or delete actions.

## Endpoints Used Or Added

No new backend endpoints were added.

Existing endpoints used:

- `POST /api/auth/login`
  - Existing login flow.

- `GET /api/admin/tenants`
  - Existing tenant selector flow.

- `GET /api/admin/pages?tenantId={tenantId}`
  - Used by `/dashboard/pages` to list pages for the selected tenant.

- `GET /api/admin/pages/{tenantId}/{pageSlug}`
  - Used by the new read-only page detail view.

The admin client no longer sends `X-API-Key` from browser code for these admin calls.

## Admin Screens Added Or Updated

- Updated: `/dashboard/pages`
  - Tenant-scoped read-only page list.
  - Shows slug, title, published status, sitemap status, and updated date.
  - Opens the read-only detail route.
  - Includes local public preview links.

- Added: `/dashboard/pages/[id]/view?tenantId={tenantId}`
  - Read-only page inspection screen.
  - Shows SEO and content block data in a structured way.
  - Labels missing and unsupported fields.

Existing login and tenant selector flows are reused.

## Tenant Selection

Tenant selection continues to use the existing `TenantSelector` and `AuthContext`.

The page list uses `currentTenant.tenantId` from the authenticated admin context. The read-only detail route uses the `tenantId` query string from the page list and falls back to the selected tenant or the user's tenant ID.

Tenant isolation remains enforced by the existing API rules: a non-SuperAdmin can only read their own tenant, while SuperAdmin can request other tenants.

## Page Listing

The page manager lists CMS pages with:

- Title
- Slug
- Page type
- Published/draft status
- Sitemap included/hidden status
- Updated date, when available
- View action
- Preview action

Local preview link mapping:

- `ice-rink-rentals` -> `http://localhost:3002`
- `roller-rink-rentals` -> `http://roller.localhost:3002`
- Unknown future tenants fall back to `http://localhost:3002`

## Read-Only Scope

Read-only in Phase 1 means:

- No create action on the Phase 1 page manager.
- No save/update controls in the new detail view.
- No destructive delete.
- No archive action.
- No publish/unpublish action.
- No import/export action.
- No production data mutation.

The older editor route still exists in the codebase, but the updated Phase 1 page manager links to the new read-only route.

## Checks Run

- `npm install` in `apps/admin`
  - Completed successfully.
  - Installed local admin dependencies needed for checks.
  - Reported `10 vulnerabilities` from the existing dependency tree.

- `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/[id]/view/page.tsx" "src/lib/api.ts"`
  - Passed.

- `git diff --check`
  - Passed.

- `npm run lint`
  - Failed on existing unrelated lint issues in:
    - `src/app/dashboard/icons/page.tsx`
    - `src/app/dashboard/page.tsx`
    - `src/app/dashboard/pages/[id]/page.tsx`
    - `src/app/dashboard/tenants/page.tsx`
  - The new Phase 1 page manager files passed targeted lint.

- `npx tsc --noEmit --incremental false --pretty false`
  - Failed on existing unrelated implicit `any` errors in `src/app/dashboard/themes/[id]/page.tsx`.

- `npm run build`
  - Compiled successfully, then failed during lint/type validation because of existing unrelated lint issues.

- `npx next build --no-lint`
  - Compiled successfully, then failed type validation on existing unrelated implicit `any` errors in `src/app/dashboard/themes/[id]/page.tsx`.

- Local admin dev server
  - Started on `http://localhost:3001`.
  - `http://localhost:3001/login` returned `200 OK`.
- `http://localhost:3001/dashboard/pages` returned `200 OK`.

- Protected local files
  - `.env.local` was not modified.
  - `apps/ice-rink-web/.env.local` was not modified.
  - `apps/pumpkin-api/appsettings.Development.json` was not modified.

Authenticated runtime listing for `ice-rink-rentals` and `roller-rink-rentals` was not performed because no admin credentials or secrets were used. The UI is wired to the tenant selector and JWT admin endpoints for both tenant IDs.

## How To Run Locally

From `apps/admin`:

```powershell
npm install
npm run dev -- -p 3001
```

Open:

- `http://localhost:3001/login`
- After login, use the tenant selector and open `/dashboard/pages`.

The Pumpkin API should be running at the admin client's configured API URL, defaulting to `http://localhost:5064`.

## Known Limitations

- Full admin lint/type/build checks are blocked by existing unrelated dashboard/theme-editor issues.
- Auth verify/logout client calls still target endpoints that the audit identified as missing.
- The older editable page route remains present and should be handled in a later safety pass.
- Phase 1 does not implement create, duplicate, edit, publish/unpublish, archive, delete, import, export, diff, validation, revisions, or rollback.
- Hero/local/closing image slots are detected from existing block fields where possible, but they are not yet modeled as first-class Page fields.
- Local preview host mapping is hard-coded for the two confirmed local tenants and needs a tenant/domain-driven strategy for future tenants and Azure/Cloudflare deployment.

## Next Implementation Phase Recommendation

Before adding live editing, fix the existing admin lint/type blockers so the branch has a clean validation baseline.

Then implement the next editor phase as a guarded structured editor workflow:

- Keep the new read-only detail route as the inspection baseline.
- Add explicit edit mode with validation and dirty-state protection.
- Add revision snapshots before save.
- Add preview-before-publish behavior.
- Add duplicate and unpublish/archive only after validation and rollback rules are agreed.

Import/export should remain out of the next immediate step until page validation and revision safety are in place.
