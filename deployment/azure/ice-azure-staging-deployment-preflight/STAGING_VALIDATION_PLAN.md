# Staging Validation Plan

Generated: 2026-06-06

## Before Deployment

Before any future deployment approval is executed:

1. Confirm branch and commit.
2. Confirm `git status --short` has no protected config risk.
3. Confirm no generated static artifacts are staged.
4. Rerun or confirm the latest official CMS-backed export.
5. Rerun validators with the approved endpoint env:

```powershell
cd apps/ice-rink-web
npm run validate:snapshot:ice
```

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Expected result:

```text
42 files, 0 errors, 0 warnings
```

## Deployment Evidence To Capture Later

- Azure Static Web App name
- Azure resource group
- Azure default hostname
- deployment method
- artifact root
- commit SHA
- deployment timestamp
- validation status
- rollback artifact or prior deployment reference

Do not record deployment token values.

## After Deployment

Run:

- route smoke tests from `STAGING_SMOKE_TEST_PLAN.md`
- media URL checks
- form UI and safe endpoint `OPTIONS` checks
- sitemap/robots checks
- canonical/meta checks
- noindex check
- 404 behavior check
- obsolete route check
- mobile/responsive spot check

## Pass Criteria

Azure staging can be marked ready only after:

- Azure default host is known and reachable.
- `/`, `/contact`, `/service-areas`, `/sitemap.xml`, and `/robots.txt` return expected responses.
- Static assets load.
- Media loads from `media.iceskatingrinkrentals.com`.
- No local media, `latestSnapshot`, secrets, localhost, or `CMS LIVE` markers are found.
- Contact form UI loads.
- Safe endpoint preflight behavior is documented.
- No valid email test is run unless explicitly approved.
- Rollback path is documented.

## Failure Handling

- If pages/assets fail, stop and document the staging URL and failed route.
- If form CORS fails for the Azure default hostname, do not change Function settings. Request separate approval to update allowed origins or classify form submission testing as deferred.
- If custom domain is needed, request separate DNS/Cloudflare approval.
- If production canonical behavior is a concern, keep staging private and document the review outcome.
