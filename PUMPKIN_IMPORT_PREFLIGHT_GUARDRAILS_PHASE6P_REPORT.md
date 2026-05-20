# Pumpkin Import Preflight Guardrails - Phase 6P Report

## Summary

Phase 6P hardens the existing Import/Export page with JSON preflight validation, import diff preview summaries, staged package context, and explicit confirmation gates before write imports. No new write path was added; Import/Export remains the only bulk import path.

## Files Changed

- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/app/dashboard/pages/content-packages/page.tsx`
- `deployment/static-azure/import-preflight-guardrails.md`
- `PUMPKIN_IMPORT_PREFLIGHT_GUARDRAILS_PHASE6P_REPORT.md`

## Preflight Workflow

For JSON imports, Import/Export now computes:

- Phase 6M content contract validation summary
- Phase 6O import diff summary
- import mode context
- tenant match status
- create/update/skip/conflict counts
- blocking error count
- warning count
- risk categories
- published update count
- slug change count
- static rebuild-needed count

Preflight is computed from the currently loaded JSON and current selected tenant pages. It does not write pages.

## Validation Integration

The Import/Export page reuses:

```text
apps/admin/src/lib/content-json-contracts.ts
```

Contract errors block write imports. Warnings require an explicit acknowledgement when a write mode is selected.

## Diff Integration

The Import/Export page reuses:

```text
apps/admin/src/lib/import-diff.ts
```

Diff errors, tenant mismatches, and matching conflicts block write imports. The page also links to the full Import Diff Preview for deeper inspection and downloadable reports.

## Confirmation Gates

Write imports are gated as follows:

- dry-run remains the default and writes nothing
- `Run Import` stays disabled in dry-run mode
- contract validation errors block writes
- diff errors block writes
- tenant mismatch blocks writes
- id/PageId/slug conflicts block writes
- updates to published pages require confirmation
- slug changes require confirmation
- warning-heavy packages require confirmation

Confirmation labels:

- `I understand this will update published pages and create revisions.`
- `I understand slug changes may create redirects and affect SEO/Ads final URLs.`
- `I understand this package has warnings that should be reviewed.`

## Staged Package Handoff

Content Package Staging now includes package status and source label in the Import/Export handoff.

Import/Export displays:

- package name
- package tenant
- package source
- package review status

If a handed-off package is not marked `ready_for_import`, the preflight section warns the admin before any write mode.

## CSV/XLSX Notes

CSV/XLSX import remains supported through the existing parser and dry-run validation. The new contract/diff preflight is strongest for JSON, which is the recommended format for externally generated production content packages because it preserves the canonical Page document shape.

## Import Result Report

After actual write imports, the report continues to show:

- creates
- updates
- skips
- errors
- warnings
- write completion
- `revisionCreated` where the API reports it

The report now also includes View links for affected pages and a reminder to review the Publishing Dashboard and Publish Action Center before static release.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint - passed
- browser smoke test for Import/Export preflight guardrails - passed
- `git diff --check` - passed; Git reported expected LF-to-CRLF working copy normalization warnings for touched admin files only
- protected config check for `.env.local` and `appsettings.Development.json` - passed with no changes reported
- targeted secret scan over changed Phase 6P source/docs/report files - passed with no matches

## Runtime Verification

Browser smoke verification completed:

- Opened `/dashboard/pages/import-export` in an authenticated local admin browser context.
- Pasted placeholder-safe JSON with a new Ice tenant slug.
- Confirmed validation summary appeared in Import Preflight Guardrails.
- Confirmed diff summary showed create/static rebuild risk.
- Ran JSON dry-run and confirmed the UI reported no pages were written.
- Pasted placeholder-safe JSON matching an existing Ice tenant page slug.
- Switched to `upsert` write mode.
- Confirmed diff/preflight showed update context.
- Confirmed write-mode confirmation gates appeared.
- Confirmed `Run Import` was disabled before required confirmations.
- Staged a local-only package through Content Package Staging.
- Used `Go To Import/Export` and confirmed the staged package context displayed in preflight.
- Ice page count remained unchanged at `8` before and after the smoke test.
- Existing test page title remained unchanged after preflight/dry-run testing.
- No Page documents were created or updated during preflight testing.
- No import, publish, deploy, purge, static export, hard delete, provider research, state research, or production page creation occurred.

## Known Limitations

- Contract/diff preflight currently focuses on JSON imports.
- CSV/XLSX still rely on the existing import dry-run validation path.
- The warning gate is broad; future work may make severity thresholds configurable.
- The page does not persist preflight approval artifacts to CMS yet.

## Next Recommended Phase

Add a pre-import approval artifact that bundles contract validation, import diff, import dry-run, reviewer status, and package metadata for auditability before production imports.
