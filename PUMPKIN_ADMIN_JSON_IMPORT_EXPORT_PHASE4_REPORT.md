# Pumpkin Admin JSON Import/Export Phase 4 Report

## Executive Summary

Phase 4 added a tenant-scoped JSON import/export foundation for Pumpkin CMS Page documents.

The implementation is admin-side and uses the existing authenticated page endpoints for list, create, and update. No bulk API endpoints were added in this phase. This keeps the JSON artifact shape close to the current Cosmos Page document shape and aligns with the future Option C static-first publishing direction.

No CSV/XLSX, static export publishing, hard delete, drag-and-drop, environment-file changes, or tenant API key exposure were added.

## Files Changed

- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
  - New JSON import/export admin route.
- `apps/admin/src/app/dashboard/pages/page.tsx`
  - Added a JSON Import/Export toolbar button.
- `PUMPKIN_ADMIN_JSON_IMPORT_EXPORT_PHASE4_REPORT.md`
  - Added this report.

## Endpoints Used Or Added

No new endpoints were added.

Existing authenticated admin endpoints used:

- `GET /api/admin/pages?tenantId={tenantId}`
- `POST /api/admin/pages/{tenantId}`
- `PUT /api/admin/pages/{tenantId}/{pageSlug}`

All requests use the existing JWT admin auth flow. Tenant API keys are not used in the browser.

## Export Behavior

New route:

- `/dashboard/pages/import-export`

Export options:

- Export all pages for the selected tenant.
- Export only published pages for the selected tenant.
- Export one selected page.

Export file behavior:

- All-pages and published-pages exports download a wrapped JSON object:
  - `format`
  - `version`
  - `tenantId`
  - `exportedAt`
  - `pageCount`
  - `pages`
- Single-page export downloads the Page document directly.

The exported Page documents preserve the current Page shape returned by the admin API, including:

- `id`
- `PageId`
- `tenantId`
- `pageSlug`
- `PageVersion`
- `Layout`
- `MetaData`
- `searchData`
- `ContentData.ContentBlocks`
- `contentRelationships`
- `seo`
- `isPublished`
- `publishedAt`
- `includeInSitemap`

## Import Behavior

Accepted JSON inputs:

- A single Page document.
- An array of Page documents.
- A wrapped export object with a `pages` array.

Input methods:

- Paste JSON into the admin textarea.
- Upload a `.json` file.

The default mode is dry-run only. Writes only happen when the admin selects a write mode and clicks Run Import.

## Import Modes

Supported modes:

- `dry-run`
  - Validates and previews creates, updates, skips, errors, and warnings.
  - Writes nothing.
- `upsert`
  - Creates missing same-tenant slugs.
  - Updates existing same-tenant slugs.
- `create-only`
  - Creates missing same-tenant slugs.
  - Skips existing same-tenant slugs.
- `update-only`
  - Updates existing same-tenant slugs.
  - Skips missing same-tenant slugs.

If validation errors exist, write import is blocked.

## Validation Rules

Implemented validation:

- `tenantId` must match the selected tenant unless the admin explicitly enables tenant rewrite.
- Tenant rewrite changes imported pages to the selected tenant.
- When tenant rewrite crosses tenant IDs, `id` and `PageId` are regenerated for the selected tenant.
- `pageSlug` is required.
- `pageSlug` is normalized with visible warnings.
- Duplicate slugs inside the import payload are errors.
- Missing `id` or `PageId` is warned and generated safely.
- Same-tenant slug collisions are reported.
- `ContentData.ContentBlocks` must be an array.
- `isPublished` must be boolean.
- `includeInSitemap` must be boolean.
- Missing `MetaData` is warned and filled with safe defaults for write.
- Missing `seo` is warned and filled with safe defaults for write.
- Unknown blocks and unknown block content are preserved in the imported document payload.
- Cross-tenant writes are not performed silently.

## Preview And Report Behavior

Dry-run and import both show a structured report with:

- total pages
- creates
- updates
- skips
- errors
- warnings
- title/pageSlug summary
- action per page
- existing/new status
- published/sitemap status
- per-page errors and warnings

No complex visual diff was added. The preview table is intentionally simple and audit-focused.

## Downloadable Logs

After dry-run or import, the admin can download a JSON report containing:

- mode
- tenantId
- timestamp
- total
- created count
- updated count
- skipped count
- error count
- warning count
- per-page results

## Tenant Safety Notes

- Exports only use pages loaded for the selected tenant.
- Import writes only call selected-tenant admin endpoints.
- Tenant mismatch blocks import unless the admin explicitly checks the tenant rewrite option.
- Tenant rewrite still writes only to the selected tenant.
- No tenant API keys are exposed or required.
- Hard delete is not present.

## Static Publishing Alignment

The export format is designed to be reusable as a portable content artifact for Option C static-first publishing.

Current format:

- Uses the existing CMS Page document shape.
- Keeps Page documents under `pages` for all/published exports.
- Supports direct single-Page JSON for focused edits or seed reuse.

Future static publishing difference:

- Static export may need build metadata, domain info, asset manifests, and generated route/sitemap outputs.
- Those future fields should wrap around the Page JSON instead of changing the core Page document shape.

## Runtime Verification Results

Local targets used:

- Pumpkin API: `http://localhost:5064`
- Admin app: `http://localhost:3001`
- Public ice frontend: `http://localhost:3002`

Runtime checks passed:

- Logged in to admin.
- Opened `/dashboard/pages/import-export`.
- Exported all `ice-rink-rentals` pages to JSON.
- Confirmed the export payload was tenant-scoped.
- Imported the exported JSON as dry-run and saw existing pages planned as updates.
- Ran create-only dry-run and saw existing pages skipped.
- Ran upsert dry-run and saw existing pages planned as updates.
- Imported a copied ice page with new slug `phase-4-json-import-52530861`.
- Confirmed the imported page appeared in the admin page list via API.
- Confirmed the imported page rendered publicly because it was imported as published.
- Switched to `roller-rink-rentals`.
- Ran a roller wrapped-export dry-run and saw existing roller pages planned as updates.

Local data note:

- Runtime verification created a local Cosmos page: `phase-4-json-import-52530861`.
- It was not removed because hard delete is intentionally not available in this branch phase.

## Checks Run

Passed:

- `npm run type-check` from `apps/admin`
- `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/import-export/page.tsx"` from `apps/admin`
- `git diff --check`
- Runtime browser verification for export, dry-run, write import, public render, and roller dry-run

Not run:

- `dotnet build`, because Phase 4 did not change Pumpkin API code.

Notes:

- `git diff --check` passed with a Git line-ending notice on `apps/admin/src/app/dashboard/pages/page.tsx`.
- A diff-only sensitive-value pattern scan returned no matches.

## Known Limitations

- No CSV/XLSX support yet.
- No static export publishing yet.
- No hard delete.
- No archive restore integration.
- No complex field-level visual diff.
- No import rollback/revision snapshot UI.
- No server-side bulk import endpoint yet.
- Top-level fields outside the current Page model may not round-trip through the .NET API model, but unknown block content is preserved.
- Public draft preview is still not a true preview mode.

## Next Recommended Phase

Recommended next phase: CSV/XLSX import/export or static export publishing foundation.

Suggested decision:

- Choose CSV/XLSX next if the priority is WP All Import/Export style editing at scale.
- Choose static export publishing next if the priority is Option C deployment flow and Azure/Cloudflare publishing.
