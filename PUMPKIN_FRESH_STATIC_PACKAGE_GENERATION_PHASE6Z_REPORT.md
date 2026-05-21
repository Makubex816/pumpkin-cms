# Pumpkin Fresh Static Package Generation - Phase 6Z Report

## Summary

Phase 6Z generated fresh CMS-backed static artifacts and a fresh dry-run release package for Ice and Roller using only the five allowed variables loaded from `apps/ice-rink-web/.env.local` into the current PowerShell process.

No secret values were printed or copied into this report. `.env.local` was read only for the authorized variable load and was not modified. `appsettings.Development.json` was not read or modified.

No Azure resources were created. No Azure deployment, Cloudflare change, DNS change, email send, production page creation, provider/state research, hard delete, active workflow, or static package upload occurred.

## Starting State

- `git status --short` was clean at the start.
- `apps/ice-rink-web/.env.local` was authorized for this phase only.
- The loader extracted only:
  - `PUMPKIN_API_URL`
  - `ICE_RINK_RENTALS_API_KEY`
  - `ROLLER_RINK_RENTALS_API_KEY`
  - `ICE_RINK_RENTALS_TENANT_ID`
  - `ROLLER_RINK_RENTALS_TENANT_ID`
- Presence verification printed only `PRESENT` / `MISSING`.
- All five allowed variables were `PRESENT`.

## Commands Run

Repository status:

```powershell
git status --short
```

Allowed current-process env load and presence check:

```powershell
$allowed = @(
  "PUMPKIN_API_URL",
  "ICE_RINK_RENTALS_API_KEY",
  "ROLLER_RINK_RENTALS_API_KEY",
  "ICE_RINK_RENTALS_TENANT_ID",
  "ROLLER_RINK_RENTALS_TENANT_ID"
)

# Read apps/ice-rink-web/.env.local, load only the allowed keys into Process env,
# then print only PRESENT/MISSING status for each key.
```

Fresh CMS snapshot/export/dry-run sequence:

```powershell
cd apps/ice-rink-web

npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms

npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms

npm run publish:dry-run:cms
```

Static artifact validators:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out "apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out "apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out"
```

Fresh staging package validators:

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/2026-05-21-1605/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/2026-05-21-1605/roller-rink-rentals"

node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/2026-05-21-1605/ice-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out ".static-release-dry-runs/2026-05-21-1605/roller-rink-rentals"
```

## Generated Folders

Fresh dry-run run ID:

```text
2026-05-21-1605
```

Generated / refreshed static artifact folders:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
```

Generated dry-run release folders:

```text
.static-release-dry-runs/2026-05-21-1605/ice-rink-rentals
.static-release-dry-runs/2026-05-21-1605/roller-rink-rentals
```

Dry-run manifest and summary:

```text
.static-release-dry-runs/2026-05-21-1605/static-publish-dry-run-manifest.json
.static-release-dry-runs/2026-05-21-1605/STATIC_PUBLISH_DRY_RUN_SUMMARY.md
```

These generated folders/files are local generated artifacts and should not be committed.

## Ice Validation Result

CMS snapshot/export:

- site key: `ice-rink-rentals`
- tenant ID used by scripts: `ice-rink-rentals`
- CMS snapshot page count: 6
- CMS snapshot published count: 6
- static generation result: `ok: true`
- generated page count: 6
- sitemap count: 6
- redirect count: 1
- static publish warning count: 40

Static artifact validator:

- path: `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`
- result: passed
- file count: 48
- errors: 0
- warnings: 0

Fresh staging package validator:

- path: `.static-release-dry-runs/2026-05-21-1605/ice-rink-rentals`
- result: passed
- file count: 48
- errors: 0
- warnings: 0

Fresh release static output validator:

- path: `.static-release-dry-runs/2026-05-21-1605/ice-rink-rentals`
- result: passed
- file count: 48
- errors: 0
- warnings: 0

Dry-run summary:

- source validator: passed
- release validator: passed
- canonical sitemap check: passed
- secret scan: passed
- ready for manual upload: yes

Notable non-blocking warnings:

- page quality warnings remain for workflow approval, static eligibility/rebuild status, fulfillment disclosure, service schema fields, and form configuration.
- content warning: possible localhost reference in the Next.js polyfills chunk.

## Roller Validation Result

CMS snapshot/export:

- site key: `roller-rink-rentals`
- tenant ID used by scripts: `roller-rink-rentals`
- CMS snapshot page count: 3
- CMS snapshot published count: 3
- static generation result: `ok: true`
- generated page count: 3
- sitemap count: 3
- redirect count: 0
- static publish warning count: 30

Static artifact validator:

- path: `apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`
- result: passed
- file count: 42
- errors: 0
- warnings: 0

Fresh staging package validator:

- path: `.static-release-dry-runs/2026-05-21-1605/roller-rink-rentals`
- result: passed
- file count: 42
- errors: 0
- warnings: 0

Fresh release static output validator:

- path: `.static-release-dry-runs/2026-05-21-1605/roller-rink-rentals`
- result: passed
- file count: 42
- errors: 0
- warnings: 0

Dry-run summary:

- source validator: passed
- release validator: passed
- canonical sitemap check: passed
- secret scan: passed
- ready for manual upload: yes

Notable non-blocking warnings:

- page quality warnings remain for workflow approval, missing revisions/rollback snapshots, static eligibility/rebuild status, missing template/fulfillment fields, and form configuration.
- content warnings remain for possible local proof copy and localhost references in generated HTML/text outputs and the Next.js polyfills chunk.

## Ready / Not Ready Staging Assessment

Ice and Roller are technically ready as fresh local dry-run packages for manual staging review:

- both fresh static artifact folders validate cleanly
- both fresh dry-run release folders validate cleanly
- both sites are marked `readyForManualUpload: true` in the dry-run manifest
- no deployment was attempted
- no Cloudflare or DNS change was attempted

They are not production-cutover ready yet because page-quality and content warnings remain. The next safe step is Azure SWA staging review on a default Azure host only, using the run ID `2026-05-21-1605`, after Timothy approves manual staging execution.

## Protected Files

Phase 6Z read `apps/ice-rink-web/.env.local` only for the authorized five-key env load.

Phase 6Z did not modify:

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`

Phase 6Z did not add or modify `.github/workflows`.

## Checks Run

- `git status --short` at start - clean
- allowed `.env.local` loader - completed without printing values
- current-process presence check - all five allowed variables were `PRESENT`
- Ice CMS snapshot - passed with warnings
- Ice CMS snapshot validation - passed with warnings
- Ice CMS static export - passed with warnings
- Roller CMS snapshot - passed with warnings
- Roller CMS snapshot validation - passed with warnings
- Roller CMS static export - passed with warnings
- CMS static publish dry run - passed
- static artifact validator for Ice - passed
- static artifact validator for Roller - passed
- staging package validator for fresh Ice release folder - passed
- staging package validator for fresh Roller release folder - passed
- static output validator for fresh Ice release folder - passed
- static output validator for fresh Roller release folder - passed
- `node --check` for changed `.mjs` files - not applicable because Phase 6Z changed no `.mjs` files
- `git diff --check` - passed
- direct trailing whitespace scan over this untracked report - passed
- protected config/workflow check for `.env.local`, `appsettings.Development.json`, and `.github/workflows` - passed with no changes reported
- targeted secret scan over this report - passed; findings were limited to placeholder API key environment variable names and no-secret/no-token safety wording

## Deployment Boundary

Not performed:

- Azure resource creation
- Azure deployment
- SWA CLI deployment
- deployment token addition
- active GitHub Actions workflow creation
- Cloudflare change
- DNS change
- email send
- production page creation
- provider/state/company research creation
- hard delete
