# Pumpkin Admin CSV/XLSX Import/Export Phase 5A Report

## Executive Summary

Phase 5A extends the existing admin Page import/export tool from JSON-only to JSON, CSV, and XLSX.

The implementation stays tenant-scoped, uses the same authenticated admin page list/create/update API path from Phase 4, and keeps JSON as the closest canonical Page artifact for future Option C static publishing. CSV and XLSX are treated as admin bulk-edit formats.

No static export publishing, hard delete, drag-and-drop, backend API changes, environment-file changes, or tenant API key exposure were added.

## Files Changed

- `apps/admin/package.json`
  - Added `exceljs` for browser-side XLSX read/write support.
- `apps/admin/package-lock.json`
  - Updated dependency lockfile.
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
  - Expanded the import/export screen to support JSON, CSV, and XLSX.
- `apps/admin/src/app/dashboard/pages/page.tsx`
  - Renamed the toolbar action from `JSON Import/Export` to `Import/Export`.
- `PUMPKIN_ADMIN_CSV_XLSX_IMPORT_EXPORT_PHASE5A_REPORT.md`
  - Added this report.

## CSV Export Behavior

The admin can export selected-tenant pages as CSV.

Supported scopes:

- all pages
- published pages
- one selected page

The CSV uses a flattened Page row shape with practical bulk-edit fields:

- `id`
- `PageId`
- `tenantId`
- `pageSlug`
- `PageVersion`
- `Layout`
- `MetaData.title`
- `MetaData.description`
- `MetaData.category`
- `MetaData.product`
- `MetaData.keyword`
- `MetaData.pageType`
- `MetaData.createdAt`
- `MetaData.updatedAt`
- `MetaData.author`
- `MetaData.language`
- `MetaData.market`
- `seo.metaTitle`
- `seo.metaDescription`
- `seo.robots`
- `seo.canonicalUrl`
- `isPublished`
- `includeInSitemap`
- `publishedAt`
- practical `contentRelationships.*` fields

Complex fields are kept as JSON columns:

- `ContentData.ContentBlocks`
- `searchData`
- `seo.keywords`
- `seo.alternateUrls`
- `seo.structuredData`
- `seo.openGraph`
- `seo.twitterCard`
- `contentRelationships.relatedHubs`
- `layoutPositions`

## XLSX Export Behavior

The admin can export selected-tenant pages as XLSX.

XLSX uses `exceljs@4.4.0`.

Workbook sheets:

- `Pages`
  - One row per Page using the same flattened headers as CSV.
  - Complex fields remain JSON cell values.
- `Schema`
  - Brief import guidance.
  - Tenant context.
  - Header list with JSON-column notes.

Dependency note:

- The `xlsx` package was not kept because its current npm package has unresolved high-severity audit findings.
- `exceljs` was used instead. After the non-breaking npm audit fix, production audit output is limited to the existing Next/PostCSS advisories that require a breaking Next major upgrade.

## CSV Import Behavior

The admin can paste or upload CSV.

CSV import:

- Parses the flattened header row.
- Rebuilds Page-like documents from flat fields.
- Parses JSON columns safely.
- Uses the same validation/report/write path as JSON import.
- Blocks rows with invalid complex JSON.
- Preserves unknown block structures when they are supplied through `ContentData.ContentBlocks`.

CSV import does not preserve arbitrary non-standard CSV columns in this MVP. Non-standard columns are reported as ignored with a warning.

## XLSX Import Behavior

The admin can upload XLSX.

XLSX import:

- Reads the `Pages` sheet, or the first worksheet if `Pages` is not present.
- Uses the same flattened headers as CSV.
- Supports the same import modes and validation behavior as CSV.
- Shows a generated JSON preview of parsed rows before dry-run/import.

MVP scope:

- XLSX import supports the `Pages` sheet only.
- The `Schema` sheet is documentation only.

## Templates Provided

Template downloads were added:

- CSV template
- XLSX template

Each template includes:

- the full supported header set
- one example Page row scoped to the selected tenant
- JSON columns populated with valid JSON

## Import Modes

Import modes mirror Phase 4 JSON behavior:

- `dry-run`
  - Default mode.
  - Validates and previews without writing.
- `upsert`
  - Creates missing same-tenant slugs.
  - Updates existing same-tenant slugs.
- `create-only`
  - Creates missing same-tenant slugs.
  - Skips existing same-tenant slugs.
- `update-only`
  - Updates existing same-tenant slugs.
  - Skips missing same-tenant slugs.

Writes are blocked when validation errors are present.

## Validation Rules

Validation remains aligned with Phase 4:

- `tenantId` must match the selected tenant unless tenant rewrite is explicitly enabled.
- Cross-tenant imports are never written silently.
- `pageSlug` is required.
- `pageSlug` is normalized with visible warnings.
- Duplicate slugs inside the import payload are errors.
- Same-tenant slug collisions are reported and handled by import mode.
- `id` and `PageId` are generated when missing.
- `ContentData.ContentBlocks` must be an array.
- `isPublished` must parse to boolean.
- `includeInSitemap` must parse to boolean.
- Invalid JSON columns block the row and include the source row number.
- Missing `MetaData` or `seo` is filled with safe defaults on write.
- Unknown blocks inside `ContentData.ContentBlocks` are preserved.

## Import Preview And Reports

The report preview now includes source type:

- JSON
- CSV
- XLSX

The preview shows:

- total rows/pages
- creates
- updates
- skips
- errors
- warnings
- source row
- page title
- slug
- action
- published/sitemap status
- per-page messages

Dry-run and import reports can still be downloaded as JSON.

## Tenant Safety Notes

- Export uses pages already loaded through the selected tenant.
- Import writes call only the selected-tenant admin endpoints.
- Tenant mismatch blocks import unless explicit tenant rewrite is enabled.
- Tenant rewrite regenerates `id` and `PageId` when crossing tenants.
- Browser code uses the existing JWT admin flow.
- Tenant API keys are not used or exposed.
- Hard delete remains unavailable.

## Static Publishing Alignment

Phase 5A does not implement static publishing.

Recommended future source flow:

- JSON remains the closest portable Page document format.
- CSV/XLSX are admin bulk-edit formats.
- Future static publishing should consume validated Page documents from Cosmos or canonical JSON artifacts.
- Static publishing should not consume raw CSV/XLSX directly without first validating/importing them into the Page shape.

## Runtime Verification Results

Local targets used:

- Pumpkin API: `http://localhost:5064`
- Admin app: `http://localhost:3001`
- Public frontend: `http://localhost:3002`

Runtime checks passed:

- Opened `/dashboard/pages/import-export`.
- Selected `ice-rink-rentals`.
- Exported all ice pages as CSV.
- Confirmed CSV headers included `ContentData.ContentBlocks`.
- Confirmed exported CSV rows were tenant-scoped to `ice-rink-rentals`.
- Exported all ice pages as XLSX.
- Confirmed XLSX contained `Pages` and `Schema` sheets.
- Downloaded CSV template.
- Downloaded XLSX template.
- Dry-ran imported ice CSV.
- Create-only dry-run against existing ice CSV showed skips.
- Uploaded exported ice XLSX and dry-ran XLSX import.
- Exported JSON and dry-ran JSON import to confirm Phase 4 behavior still works.
- Imported one copied ice CSV row with unique slug `phase-5a-csv-import-54754949`.
- Confirmed the imported page appeared in admin page data.
- Confirmed the imported published page rendered publicly.
- Switched to `roller-rink-rentals`.
- Exported roller pages as CSV.
- Confirmed roller CSV rows were tenant-scoped to `roller-rink-rentals`.
- Dry-ran roller CSV import.

Local data note:

- Runtime verification created a local Cosmos page: `phase-5a-csv-import-54754949`.
- It was not removed because hard delete is intentionally not available.

## Checks Run

Passed:

- `npm run type-check` from `apps/admin`
- `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/import-export/page.tsx"` from `apps/admin`
- Runtime browser verification for CSV export/import, XLSX export/import, templates, JSON regression, and Roller CSV dry-run
- `npm audit --omit=dev` after non-breaking audit fix showed only existing Next/PostCSS advisories requiring a breaking Next major upgrade

Additional build check:

- `npm run build` compiled successfully, then failed during full-app lint on pre-existing unrelated admin lint issues in:
  - `src/app/dashboard/icons/page.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/app/dashboard/pages/[id]/page.tsx`
  - `src/app/dashboard/tenants/page.tsx`
- These were not introduced by Phase 5A and were outside the requested scope.

Not run:

- `dotnet build`, because Phase 5A did not change Pumpkin API code.

## Known Limitations

- CSV/XLSX preserve the supported flattened Page fields and supported JSON columns, not arbitrary extra CSV/XLSX columns.
- XLSX import supports the `Pages` sheet only.
- No visual cell-by-cell diff yet.
- No server-side bulk import endpoint yet.
- No import rollback or revision snapshot UI yet.
- Public draft preview is still not a true preview mode.
- Static export publishing is not implemented in this phase.
- No hard delete.

## Next Recommended Phase

Recommended next phase: Static Export Publishing Foundation.

Suggested Phase 5B direction:

- Generate static-ready JSON artifacts from validated Page documents.
- Add tenant/domain-specific static build commands for `apps/ice-rink-web`.
- Produce separate static outputs per tenant/domain.
- Generate static sitemap and robots files.
- Define the Azure Static Web Apps or Azure Storage/CDN publish handoff with Cloudflare purge hooks.
