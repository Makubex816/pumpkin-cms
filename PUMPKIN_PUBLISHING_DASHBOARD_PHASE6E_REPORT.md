# Pumpkin Publishing Dashboard Phase 6E Report

## Summary

Phase 6E adds a tenant-scoped Publishing / Build Status dashboard for the static-first Option C workflow. The dashboard is read-only and uses the existing authenticated admin page list API to summarize CMS-to-static readiness by tenant.

No Azure deployment, Cloudflare change, hard delete, provider research, state research, production page creation, active workflow, or shell-command execution from the browser was added.

## Files Changed

- `apps/admin/src/components/TenantSelector.tsx`
- `apps/admin/src/contexts/AuthContext.tsx`
- `apps/admin/src/app/dashboard/layout.tsx`
- `apps/admin/src/app/dashboard/publishing/page.tsx`
- `apps/admin/src/lib/publishing-readiness.ts`
- `PUMPKIN_PUBLISHING_DASHBOARD_PHASE6E_REPORT.md`

## Route Added

The new dashboard route is:

```text
apps/admin/src/app/dashboard/publishing/page.tsx
```

Admin navigation now includes a `Publishing` link that points to `/dashboard/publishing`.

## Tenant Loading Fix

Runtime issue found after the first dashboard pass:

- the shared tenant selector could stay on `Loading...`
- `/dashboard/publishing` could show `Select a tenant/site before reviewing static publishing readiness`
- this happened because `AuthContext` only selected a tenant after `/api/admin/tenants` completed successfully
- if tenant loading lagged or failed, `currentTenant` stayed null even though the user token already contained a tenant ID or localStorage already had a selected tenant

Fix:

- `AuthContext` now restores a sanitized stored `TenantInfo` immediately during auth hydration
- if no stored tenant exists, it creates a safe fallback tenant from the authenticated user's `tenantId`
- fetched tenant records are normalized down to `TenantInfo` before entering React state or localStorage
- tenant list failures now set `tenantLoadError` instead of leaving the selector in an indefinite loading state
- `TenantSelector` shows loading only while auth is loading or tenant fetch is in progress with no known tenant yet; an already-known selected tenant remains visible while the tenant list refreshes
- after loading, `TenantSelector` shows the selected tenant, a tenant-load warning, or a clear failure state
- `/dashboard/publishing` now distinguishes session loading, tenant loading, tenant-load failure, and no-tenant-selected states

## Summary Metrics

The dashboard derives tenant-level metrics from the selected tenant's page list:

- total pages
- published pages
- draft/unpublished pages
- sitemap-included pages
- pages needing rebuild
- pages with readiness warnings
- pages with redirect warnings
- pages missing workflow approval
- pages missing template identity
- pages missing SEO/media/fulfillment fields
- content hash mismatch count
- Cloudflare purge flag count if future metadata records it

The page also surfaces tenant/site name, known canonical domain, deployment statuses, latest snapshot time, latest static build time, and latest deployment time when those fields exist.

## Warning Groups

Warnings are grouped into:

- SEO missing
- media and alt text missing
- fulfillment missing
- workflow approval missing
- static rebuild required
- redirect or canonical mismatch
- template identity missing
- form and lead capture config missing

The helper file exposes:

- `getPageQualityWarnings(page)`
- `getPublishingWarnings(page, tenantPages)`
- `getRedirectWarnings(page, tenantPages)`
- `getPublishingReadinessStatus(pageReadiness)`
- `buildTenantPublishingSummary(pages)`

Warnings are advisory unless they represent structural slug/redirect problems, which are classified as dashboard errors.

## Readiness Status Logic

The tenant status is derived client-side for MVP:

- `not_configured`: no pages or no published pages
- `blocked_by_errors`: any structural slug or redirect errors
- `needs_rebuild`: any page has `staticPublishing.needsRebuild`
- `needs_review`: warnings exist but no blocking errors or rebuild flag
- `ready_for_snapshot`: published pages have no current dashboard warnings

No server endpoint was added.

## Page Readiness Table

The table lists each page with:

- title
- slug
- published status
- sitemap status
- workflow status and approval flag
- `staticPublishing.needsRebuild`
- warning/error count
- redirect count
- missing fields summary
- View, Edit, and Preview actions

Preview links preserve the existing local host behavior for Ice and Roller tenants.

## Publish Dry-Run Commands

The dashboard displays copy/paste commands only. It does not run shell commands from the browser.

For `ice-rink-rentals`:

```powershell
cd apps/ice-rink-web
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run publish:dry-run:cms
```

For `roller-rink-rentals`:

```powershell
cd apps/ice-rink-web
npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms
npm run publish:dry-run:cms
```

Future tenants show a not-configured message until tenant-specific snapshot/export scripts are added.

## Tenant Safety

The dashboard reads pages through the existing authenticated `apiClient.getPages(token, tenantId)` flow. It does not expose API keys, tenant API keys, deployment tokens, or Cloudflare credentials in the browser.

All readiness calculations are scoped to the currently selected tenant's page list.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for `dashboard/publishing`, `dashboard/layout`, `lib/publishing-readiness`, `AuthContext`, and `TenantSelector` - passed
- `npm run lint` in `apps/admin` - failed on pre-existing unrelated lint issues in `dashboard/icons`, `dashboard/page-map`, `dashboard/page`, and `dashboard/tenants`
- `git diff --check` - passed
- protected config diff check for `.env.local` and `appsettings.Development.json` - no changes
- targeted secret literal scan over changed/untracked files - passed

## Runtime Verification

The admin app was already listening locally on port `3001`, and Pumpkin API was listening on port `5064`.

Verified without exposing credentials:

- `GET http://localhost:3001/dashboard/publishing` returned `200`
- admin type-check confirms the updated auth context, selector, and publishing dashboard compile together

Completed manual browser verification:

- Admin login worked.
- Publishing nav link appeared.
- `/dashboard/publishing` loaded successfully.
- Tenant selector no longer stayed stuck on `Loading...`.
- Ice Skating Rink Rentals publishing dashboard displayed summary metrics, warning groups, page readiness table, and copy/paste static publish commands.
- Roller Rink Rentals dashboard loaded after switching tenant.
- View, Edit, and Preview links were checked.
- No `.env.local` or `appsettings.Development.json` changes were made.

## Known Limitations

- Dashboard readiness is derived client-side from page list data for MVP.
- It does not run CMS snapshots, static exports, dry runs, Azure deploys, or Cloudflare purge operations.
- It does not create build history records.
- Future tenants need dedicated snapshot/export scripts before the command panel can show exact commands.
- Warning thresholds can be tuned after the first production content set is reviewed.

## Next Recommended Phase

Phase 6F should add a read-only publish run history model/report view or a non-deploying staticwebapp redirect-preview generator, depending on whether Timothy wants operator visibility or Azure staging prep next.
