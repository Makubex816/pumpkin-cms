# Import/Export Capability Review

Primary route: `/dashboard/pages/import-export`

Primary source:

- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/lib/api.ts`

Observed capabilities:

- Export all, published, or single page data.
- Export JSON or CSV.
- Import Page objects, arrays, or wrapped Pumpkin page exports.
- Parse JSON, CSV, and XLSX package inputs.
- Run dry-run validation without writing pages.
- Apply import modes by source: dry-run, upsert, create-only, update-only.
- Save ImportRun history through Pumpkin API.
- Link saved ImportRun detail pages.

V2.8.54A did not run import writes or save ImportRun history because both would create or update live records. The safe next path for a partner package is:

1. Validate package locally.
2. Load package into dry-run/import preview only.
3. Record diff and warnings.
4. Request separate approval before any page writes or ImportRun record creation.

Current status: source_present_not_live_proven for writes; route_readonly_proven for app-shell route load.

