# Pumpkin Azure SWA Staging Execution Prep - Phase 6U Report

## Summary

Phase 6U prepares Azure Static Web Apps staging execution for Ice and Roller without deploying, creating Azure resources, changing Cloudflare, changing DNS, adding secrets, or adding active GitHub Actions workflows.

## Files Changed

- `deployment/static-azure/swa-staging-execution-prep.md`
- `deployment/static-azure/static-form-endpoint-staging-plan.md`
- `deployment/static-azure/staging-validation-checklist.md`
- `deployment/static-azure/staging-rollback-checklist.md`
- `deployment/static-azure/release-manifest-review.md`
- `deployment/static-azure/validate-staging-package.mjs`
- `deployment/static-azure/README.md`
- `PUMPKIN_AZURE_SWA_STAGING_EXECUTION_PREP_PHASE6U_REPORT.md`

## Current Static Commands

From `apps/ice-rink-web`:

```powershell
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms
npm run publish:dry-run:cms
```

Expected outputs:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
.static-release-dry-runs/<runId>/ice-rink-rentals
.static-release-dry-runs/<runId>/roller-rink-rentals
```

## Staging Target Definitions

Ice:

- SWA name: `swa-ice-rink-rentals-staging`
- site key/tenant: `ice-rink-rentals`
- default Azure host first
- custom staging domain later: `staging.iceskatingrinkrentals.com`
- upload root: `.static-release-dry-runs/<runId>/ice-rink-rentals`

Roller:

- SWA name: `swa-roller-rink-rentals-staging`
- site key/tenant: `roller-rink-rentals`
- default Azure host after Ice validates
- custom staging domain later: `staging.rollerrinkrentals.com`
- upload root: `.static-release-dry-runs/<runId>/roller-rink-rentals`

## App Settings / Environment Plan

Static frontend:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<staging-function-host>/api/contact
```

Static form endpoint / Azure Function later:

```text
PUMPKIN_API_URL=<pumpkin-api-url>
ICE_RINK_RENTALS_API_KEY=<server-side-secret>
ROLLER_RINK_RENTALS_API_KEY=<server-side-secret>
STATIC_FORM_ALLOWED_ORIGINS=<azure-default-and-staging-origins>
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals,roller-rink-rentals
STATIC_FORM_DEFAULT_TENANT=<optional-placeholder>
STATIC_FORM_RATE_LIMIT_MODE=log_only
STATIC_FORM_SPAM_PROTECTION_MODE=honeypot_only
```

Only placeholders are documented. No values or tokens were added.

## SWA Runbook Summary

`swa-staging-execution-prep.md` defines the manual path:

- create Ice SWA staging resource manually
- validate Azure default host first
- deploy prebuilt static output later using SWA CLI or inactive workflow template
- repeat for Roller only after Ice passes
- keep deployment tokens outside repo
- do not touch live DNS or Cloudflare

## Static Form Endpoint Staging Plan

`static-form-endpoint-staging-plan.md` documents:

- Azure Function staging placeholder
- required app settings
- staging CORS origins
- sample payload
- Lead Inbox verification
- no real email sending
- future rate limit/CAPTCHA/monitoring work

## Validation Checklist

`staging-validation-checklist.md` now covers:

- Azure default hosts and optional staging custom domains
- home/service/contact/sitemap/robots checks
- CSS/JS assets
- old slug redirects
- no localhost references
- no exposed API keys
- static form endpoint success
- Lead Inbox receipt
- mobile smoke checks
- status/warning capture

## Rollback Checklist

`staging-rollback-checklist.md` covers:

- stopping staging URL use
- reverting to a previous validated package
- custom staging domain backout
- static form endpoint backout
- documenting failed staging tests
- avoiding Cloudflare/live DNS changes

## Manifest Review

`release-manifest-review.md` documents how to inspect:

- `static-publish-dry-run-manifest.json`
- `STATIC_PUBLISH_DRY_RUN_SUMMARY.md`
- `redirects.json`
- `sitemap.xml`
- `robots.txt`

## Validation Script

Added:

```text
deployment/static-azure/validate-staging-package.mjs
```

It checks:

- folder exists
- file count is nonzero
- `index.html`, `sitemap.xml`, and `robots.txt`
- `_next/static` presence
- `redirects.json` parse status when present
- no `.env` files
- no appsettings files
- no localhost references
- no `CMS LIVE` marker
- no high-confidence secret-looking strings

The existing `validate-static-output.mjs` remains the canonical route/domain/static output validator.

## Checks Run

- `node --check deployment/static-azure/validate-staging-package.mjs` - passed
- process environment check for CMS snapshot/dry-run secrets - `PUMPKIN_API_URL`, Ice/Roller tenant API keys, and tenant IDs were not present in the shell
- fresh CMS snapshot/export commands were not run because the required process-scoped API environment variables were unavailable and protected `.env.local` was not read
- `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` - passed, 48 files, 0 errors, 0 warnings
- `node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out` - passed, 42 files, 0 errors, 0 warnings
- latest dry-run folder found: `.static-release-dry-runs/2026-05-19-1616`
- `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder .static-release-dry-runs/2026-05-19-1616/ice-rink-rentals` - passed, 48 files, 0 errors, 0 warnings
- `node deployment/static-azure/validate-staging-package.mjs --site roller-rink-rentals --folder .static-release-dry-runs/2026-05-19-1616/roller-rink-rentals` - passed, 42 files, 0 errors, 0 warnings
- existing static output validator against latest Ice dry-run folder - passed, 48 files, 0 errors, 0 warnings
- existing static output validator against latest Roller dry-run folder - passed, 42 files, 0 errors, 0 warnings
- `git diff --check` - passed with expected LF-to-CRLF working-copy warnings for touched docs only
- protected config / active workflow check for `.env.local`, `appsettings.Development.json`, and `.github/workflows` - passed with no changes reported
- targeted secret scan over Phase 6U files - reviewed one placeholder `example.com` sample email in docs; no real email, credential value, token, private key, or deployment secret found

## Known Limitations

- No Azure resource was created.
- No SWA CLI deploy was run.
- No Cloudflare or DNS change was made.
- No deployment token was added.
- Static form endpoint Azure deployment remains a later phase.
- Fresh CMS snapshot/export/dry-run commands require process-scoped Pumpkin API settings that were not available during this prep pass.

## Next Recommended Phase

Phase 6V: Timothy-approved Ice Azure default-host staging deployment using the validated dry-run artifact, followed by browser validation, Lead Inbox form verification, and PublishRun history recording.
