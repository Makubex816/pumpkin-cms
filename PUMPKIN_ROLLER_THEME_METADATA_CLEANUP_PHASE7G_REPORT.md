# Pumpkin CMS Phase 7G - Roller Theme Metadata Cleanup / Final Source Hygiene

Date: 2026-05-22

Branch: `feature/admin-page-editor-import-export`

## Goal

Clean the remaining Roller theme metadata phrase found during Phase 7F:

- Old phrase: `Local proof theme for Roller Rink Rentals.`

This phase was limited to source CMS/theme data hygiene. No generated static output was edited, no packages were regenerated, and no Azure/Cloudflare/DNS/deployment action was performed.

## Starting Point

- Phase 7F fresh run ID: `2026-05-22-1704`
- Ice package: 44 files, validators passed, 8 page-quality warnings.
- Roller package: 42 files, validators passed, 6 page-quality warnings.
- Both sites were marked `readyForManualUpload: true`.
- Roller generated routes `/`, `/contact`, and `/roller-rink-rentals` were clean for the previous user-facing local-proof/local-dev copy.
- Remaining hygiene item was non-rendered Roller `theme.json` metadata in the source snapshot.

## Affected Theme Record

- Tenant: `roller-rink-rentals`
- Theme record: `roller-rink-rentals-default`
- Source field: `description`
- Old value: `Local proof theme for Roller Rink Rentals.`
- Replacement summary: production-safe Roller theme metadata describing portable rink rental planning.

## Files Changed

- `tools/ice-rink-local-seed/seed-sites/roller-rink-rentals/theme.json`
- `PUMPKIN_ROLLER_THEME_METADATA_CLEANUP_PHASE7G_REPORT.md`

## Source Repair Completed

The durable local seed source theme was updated from:

```json
"description": "Local proof theme for Roller Rink Rentals."
```

to:

```json
"description": "Roller Rink Rentals theme for portable rink rental planning."
```

This removes the old proof-language phrase from the committed Roller seed theme source.

## Live CMS Theme Status

The public theme read endpoint was checked with the allowed local tenant variables loaded from `apps/ice-rink-web/.env.local`. Values were not printed.

Result:

- Required allowed variables: present.
- Public theme read: succeeded.
- Live CMS theme id: `roller-rink-rentals-default`.
- Live CMS theme still has the old description: yes.
- Live CMS theme has the new description: no.

The live CMS theme was not updated in this phase because:

- Public tenant API-key theme endpoints are read-only.
- The admin theme update endpoint requires an authenticated admin JWT.
- No admin JWT was available in the current process.
- A documented local admin login attempt returned unauthorized.
- The local seed tool is not safe for this focused fix because it upserts tenant, theme, and all pages together and could overwrite prior CMS page repairs.

No secret values were printed or copied into this report.

## Source Verification

- Committed Roller seed theme source no longer contains the old theme phrase.
- Fresh Phase 7F Roller generated pages remain clean for user-facing local-proof/local-dev copy.
- Fresh Phase 7F source snapshot remains stale until CMS theme metadata is updated and a new snapshot is generated.
- Live CMS theme metadata still requires an authenticated admin update.

## Fresh Static Regeneration Required Next

Yes, but only after the live CMS theme record is updated through the authenticated admin theme path.

Regenerating before the live CMS theme update would preserve the stale description from CMS. After the live CMS update, run the normal CMS snapshot/export/dry-run flow and staging validators to produce a final governance package.

## Readiness Decision

Azure default-host staging review:

- Technically ready for generated page review based on Phase 7F.
- The remaining theme description is non-rendered metadata and does not block Azure default-host staging page review.

Production governance sign-off:

- Not ready until the live CMS Roller theme description is updated and a fresh package confirms the source snapshot is clean.
- Remaining non-theme production readiness items from Phase 7F still apply, including manual approval and `needsRebuild` governance cleanup.

## Checks Run

- Passed: Roller seed validation with `SITE_KEY=roller-rink-rentals npm run validate`.
- Passed: `git diff --check`.
  - Git emitted an LF/CRLF working-copy notice for the edited theme JSON, but no whitespace errors.
- Passed: direct trailing whitespace scan for changed files.
- Passed: protected config/workflow/generated-folder check.
- Passed: targeted secret scan for changed files.
- Not applicable: `node --check` for changed `.mjs` files; no `.mjs` files changed.

## No-Go Confirmations

- No generated static output folders were directly edited.
- No static packages were regenerated.
- No production pages were created.
- No provider/state/company research files were created.
- No hard delete was performed.
- No real emails were sent.
- No Azure resource was created.
- No Azure deployment was run.
- No Cloudflare or DNS change was made.
- No active GitHub Actions workflow was created.
- `apps/ice-rink-web/.env.local` was read only for the five allowed local variables and was not modified.
- `apps/pumpkin-api/appsettings.Development.json` was not read or modified.
