# Pumpkin Content Package Staging / Import Review Queue - Phase 6N Report

## Summary

Phase 6N adds a tenant-scoped Content Package Staging review queue for externally generated Page JSON. The implementation is browser-local and dry-run only: it validates packages, records review status, and hands JSON to the existing Import/Export page without creating, updating, publishing, deploying, or purging anything.

## Files Changed

- `apps/admin/src/app/dashboard/pages/content-packages/page.tsx`
- `apps/admin/src/app/dashboard/pages/content-validator/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `deployment/static-azure/content-package-staging.md`
- `PUMPKIN_CONTENT_PACKAGE_STAGING_PHASE6N_REPORT.md`

## Staging Strategy

The MVP uses browser `localStorage` rather than a new Cosmos container.

Local staged package records include:

- `packageId`
- `packageName`
- `tenantId`
- `sourceLabel`
- `createdAt`
- `updatedAt`
- `status`
- `notes`
- `rawJson`
- `pageCount`
- validation summary
- per-page validation results
- full validation report
- selected template contract

Allowed statuses:

- `draft`
- `needs_review`
- `ready_for_import`
- `rejected`

Packages with blocking validation errors cannot be marked `ready_for_import`.

## Route Added

Added:

```text
/dashboard/pages/content-packages
```

The route is discoverable from:

- Page Import/Export
- Content JSON Contract Validator

## Validation Integration

The staging page reuses `apps/admin/src/lib/content-json-contracts.ts`.

When a package is staged or revalidated, the validator checks:

- single Page JSON
- Page arrays
- wrapped export objects with `pages[]`
- tenant safety
- template requirements
- SEO and canonical requirements
- media/image slot requirements
- fulfillment and lead routing requirements
- lead/form fields
- internal linking requirements
- static publishing metadata
- redirect warnings

Validation results are stored with the staged package for review.

## Review Queue Behavior

The queue shows:

- package name
- local package ID
- updated time
- status
- page count
- error count
- warning count
- template distribution

Actions:

- View
- Revalidate
- Mark Ready
- Reject
- Export JSON
- Download validation report
- Go To Import/Export

Package detail shows:

- metadata
- validation summary
- per-page slug/title/template rows
- per-page errors and warnings
- copy package JSON
- copy package summary

## Import Handoff Behavior

`Open Import/Export With This Package` stores a temporary browser-local handoff payload and opens `/dashboard/pages/import-export`.

The Import/Export page then:

- switches to JSON source mode
- fills the import textarea with the staged package JSON
- clears XLSX parsed state
- leaves import mode controlled by the existing import UI
- shows a notice that the staged package was loaded

No import runs automatically.

## LocalStorage Vs CMS Persistence Decision

LocalStorage was chosen because this phase is a staging/review workflow, not a persistent package registry. It avoids new Cosmos setup, preserves the existing import/export write path, and keeps the implementation low-risk.

Known tradeoff:

- staged package history is local to one browser/profile
- package records are not shared across admins
- a future CMS-backed package registry may be useful after real package review volume grows

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for changed files - passed
- route smoke check for `/dashboard/pages/content-packages` - HTTP `200`
- `git diff --check` - passed with line-ending normalization warnings only
- protected config check for `.env.local` and `appsettings.Development.json` - no changes
- targeted high-confidence secret scan over changed files - passed

## Runtime Verification

Automated/local verification completed:

- Content Package Staging route returned HTTP `200` from the running admin dev server.
- TypeScript compilation verified the staging page, validator reuse, and Import/Export handoff code.
- Targeted lint verified the changed admin files.
- Protected config check showed no `.env.local` or `appsettings.Development.json` changes.

Browser smoke verification completed:

- Opened `/dashboard/pages/content-packages` in an authenticated local admin browser context.
- Confirmed the page showed safety messaging that staging does not import, save, publish, deploy, or purge.
- Staged the built-in example file `deployment/static-azure/content-json-template-examples/page-template-examples.json` as `Phase 6N Example Smoke Package`.
- Confirmed the example package appeared in the Review Queue with validation details, page count, errors, warnings, and per-page results.
- Example package validation produced `2 errors / 8 warnings` for the selected Ice tenant, which is expected because the example file uses placeholder tenant/domain values.
- Revalidate worked and refreshed the package validation result without creating pages.
- Mark Rejected worked and changed only the browser-local package review status.
- Mark Ready was blocked for the example package because blocking validation errors existed.
- Download Package JSON worked; the downloaded smoke artifact was removed and was not committed.
- Download Validation Report worked; the downloaded smoke artifact was removed and was not committed.
- Open Import/Export With This Package loaded the staged JSON into the existing Import/Export page.
- Import/Export did not run import automatically.
- Returned to the staging queue after the Import/Export handoff.
- Staged a local-only placeholder package named `Phase 6N Ready Smoke Package` to verify the Mark Ready path.
- The local-only placeholder package was revalidated, marked ready, then marked rejected afterward to prove status transitions are review-only.
- The local-only placeholder JSON was browser/temp-only and was not committed.
- Ice page count remained unchanged at `8` before and after the smoke test.
- The smoke slug `phase-6n-ui-smoke-valid-page` was not created in Cosmos.
- No Page documents were created, imported, saved, published, deployed, or purged.
- No provider/state research files or production pages were created.
- LocalStorage/browser staging only was used.
- Existing Import/Export remained the only write/import path.

Smoke test data used:

- built-in placeholder example JSON from `deployment/static-azure/content-json-template-examples/page-template-examples.json`
- temporary browser-only local placeholder Page JSON for Mark Ready behavior

## Known Limitations

- Content packages are stored only in browser localStorage.
- There is no CMS-backed package audit trail yet.
- The staging page does not compare staged packages against current Cosmos pages beyond the validator contract.
- The staging page does not import pages.
- The staging page does not run static export or publish workflows.

## Next Recommended Phase

Add an optional CMS-backed Content Package Registry only after real content package review needs exceed localStorage. The existing import/export write path should remain explicit and separate.
