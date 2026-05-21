# Pumpkin Static Environment Bootstrap - Phase 6W Report

## Summary

Phase 6W prepares a safe current-shell-only environment bootstrap so Timothy can manually provide the API values needed to generate fresh CMS static packages for Ice and Roller.

This phase does not deploy anything. It does not create Azure resources, change Cloudflare or DNS, send emails, create pages, create provider/state research, add workflows, or read protected config files.

## Starting State

- `git status --short` was clean at the start.
- Phase 6U was committed as `9a51740 Add Phase 6U Azure SWA staging execution prep`.
- Phase 6V report exists at `PUMPKIN_STATIC_STAGING_PREDEPLOY_VALIDATION_PHASE6V_REPORT.md`.
- Existing Ice and Roller static artifacts and latest dry-run packages were already validated in Phase 6V.
- Fresh CMS snapshot/export/dry-run commands remain pending until current-shell API environment variables are provided.

## Current-Shell Bootstrap Commands

Paste real values manually into the current PowerShell session only. These commands use placeholders and must not be committed to any repo file.

```powershell
$env:PUMPKIN_API_URL = "<PUMPKIN_API_URL>"
$env:ICE_RINK_RENTALS_API_KEY = "<ICE_RINK_RENTALS_API_KEY>"
$env:ROLLER_RINK_RENTALS_API_KEY = "<ROLLER_RINK_RENTALS_API_KEY>"
$env:ICE_RINK_RENTALS_TENANT_ID = "<ICE_RINK_RENTALS_TENANT_ID>"
$env:ROLLER_RINK_RENTALS_TENANT_ID = "<ROLLER_RINK_RENTALS_TENANT_ID>"
```

Notes:

- Do not paste values into `.env.local`, `appsettings.Development.json`, docs, reports, shell transcripts, screenshots, or committed scripts.
- These variables live only in the current PowerShell process and child processes started from it.
- Closing the shell clears these values.
- `PUMPKIN_API_URL`, `ICE_RINK_RENTALS_API_KEY`, and `ROLLER_RINK_RENTALS_API_KEY` are the required values for fresh CMS snapshots.
- Tenant ID variables are included for clarity and future compatibility; current scripts may default to the site key when tenant IDs are not separately required.

## Safe Presence Verification

Run this command after setting the variables. It only reports `present` or `missing`; it never prints values.

```powershell
$required = @(
  "PUMPKIN_API_URL",
  "ICE_RINK_RENTALS_API_KEY",
  "ROLLER_RINK_RENTALS_API_KEY",
  "ICE_RINK_RENTALS_TENANT_ID",
  "ROLLER_RINK_RENTALS_TENANT_ID"
)

$required | ForEach-Object {
  $value = [Environment]::GetEnvironmentVariable($_, "Process")
  [pscustomobject]@{
    Name = $_
    Status = if ([string]::IsNullOrWhiteSpace($value)) { "missing" } else { "present" }
  }
} | Format-Table -AutoSize
```

Expected result before running fresh package commands:

- `PUMPKIN_API_URL` is `present`
- `ICE_RINK_RENTALS_API_KEY` is `present`
- `ROLLER_RINK_RENTALS_API_KEY` is `present`
- tenant ID variables are `present` if Timothy chooses to provide them for this run

## Fresh Snapshot, Export, and Dry-Run Commands

Run these only after the current-shell verification shows the required values are present.

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

The `export:static:*:cms` scripts also perform snapshot and snapshot-validation internally. The explicit snapshot and validation commands above are kept in the operator sequence so each checkpoint can be observed before the static export and dry-run package are reviewed.

Expected output locations:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
.static-release-dry-runs/<runId>/ice-rink-rentals
.static-release-dry-runs/<runId>/roller-rink-rentals
```

## Static Artifact Validators

Run these from the repo root after exports complete.

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out "apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out "apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out"
```

## Staging Package Validators

Replace `<runId>` with the fresh dry-run folder name created by `npm run publish:dry-run:cms`.

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder ".static-release-dry-runs/<runId>/ice-rink-rentals"
node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder ".static-release-dry-runs/<runId>/roller-rink-rentals"

node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out ".static-release-dry-runs/<runId>/ice-rink-rentals"
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out ".static-release-dry-runs/<runId>/roller-rink-rentals"
```

## Non-Deployment Boundary

Phase 6W is prep only:

- no Azure Static Web Apps resource creation
- no SWA CLI deploy
- no Azure deployment token
- no active GitHub Actions workflow
- no Cloudflare change
- no DNS change
- no email sending
- no production page creation
- no static package upload

## Checks Run

- `git status --short` at start - clean
- reviewed `apps/ice-rink-web/package.json` for current script names
- reviewed `deployment/static-azure/swa-staging-execution-prep.md`
- reviewed `PUMPKIN_STATIC_STAGING_PREDEPLOY_VALIDATION_PHASE6V_REPORT.md`
- `git diff --check` - passed
- protected config/workflow check for `.env.local`, `appsettings.Development.json`, and `.github/workflows` - passed with no changes reported
- targeted secret scan over this report - passed; findings were limited to placeholder environment variable names and a no-token safety note
- `node --check` for changed `.mjs` files - not applicable because Phase 6W changed no `.mjs` files

## Protected Files

Phase 6W did not read or modify:

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`

Phase 6W did not add or modify `.github/workflows`.

## Next Step

After Timothy provides the current-shell variables manually, rerun Phase 6V fresh package generation:

1. verify variables are present without printing values
2. generate Ice CMS snapshot/export
3. generate Roller CMS snapshot/export
4. run full CMS dry-run
5. validate static artifact folders
6. validate fresh staging release folders
7. update the Phase 6V or follow-up report with the fresh run ID
