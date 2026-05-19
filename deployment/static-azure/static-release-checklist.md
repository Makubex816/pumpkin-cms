# Static Release Checklist

Use this checklist before turning a Phase 5E dry run into a real deployment.

## Pre-Build Checks

- Confirm the branch and commit are approved for release.
- Confirm CMS/Page content has been reviewed for production copy.
- Confirm no `.env.local` or `appsettings.Development.json` changes are included.
- Confirm no active workflow files were added under `.github/workflows` unless intentionally part of a later deployment phase.
- Confirm the static form endpoint decision is documented.
- Confirm `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` is configured only when a real endpoint exists.

## Static Export Commands

From `apps/ice-rink-web`:

```powershell
npm run export:static:ice
npm run export:static:roller
```

Or run the full local publish rehearsal:

```powershell
npm run publish:dry-run
```

## Validation Checks

From the repo root:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
```

Also inspect the dry-run files:

```text
.static-release-dry-runs/<run-id>/static-publish-dry-run-manifest.json
.static-release-dry-runs/<run-id>/STATIC_PUBLISH_DRY_RUN_SUMMARY.md
```

## Sitemap And Robots Checks

Ice expected files:

- `/`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Roller expected files:

- `/`
- `/roller-rink-rentals`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Confirm:

- `sitemap.xml` exists for each site.
- `robots.txt` exists for each site.
- `robots.txt` references the correct sitemap URL.
- sitemap URLs use the correct production domain.

## Canonical URL Checks

Ice canonical domain:

```text
https://iceskatingrinkrentals.com
```

Roller canonical domain:

```text
https://rollerrinkrentals.com
```

Confirm no Ice page references the Roller canonical domain and no Roller page references the Ice canonical domain.

## Form Endpoint Check

Static pages can render `/contact`, but submissions require an external endpoint.

Before production:

- confirm the form endpoint exists
- confirm the endpoint is not cached
- confirm allowed origins include the production domains
- confirm spam/rate-limit controls exist
- confirm server-side credentials are stored outside the repo
- confirm the frontend endpoint value contains only a URL

## Azure Static Web Apps Upload Checklist

- Choose the correct Static Web App resource:
  - `swa-ice-rink-rentals-prod`
  - `swa-roller-rink-rentals-prod`
- Upload the matching dry-run site folder as the prebuilt app output.
- Confirm `index.html` is served at `/`.
- Confirm route folders serve their `index.html`.
- Confirm custom domain and HTTPS are healthy.
- Confirm no runtime API route is expected from the static host.

## Azure Storage Static Website Upload Checklist

- Choose the correct storage account/container.
- Enable static website hosting.
- Set index document to `index.html`.
- Set error document to `404.html`.
- Upload the contents of the matching dry-run site folder to `$web`.
- Confirm public HTTPS strategy through Cloudflare, CDN, or Front Door.
- Confirm the upload did not remove unrelated tenant files if a shared account is ever used.

## Cloudflare Cache And DNS Checklist

- Confirm DNS points to the chosen Azure origin.
- Confirm orange-cloud proxying is enabled only when Cloudflare should serve CDN/WAF behavior.
- Cache `/_next/static/*` aggressively.
- Keep HTML caching conservative until purge automation exists.
- Bypass cache for form/API/admin endpoints.
- Purge only after upload succeeds.

## Rollback Checklist

- Keep the previous known-good dry-run or deployment artifact.
- Record the commit SHA, run ID, and deployment time.
- Roll back by re-uploading the previous artifact.
- Purge Cloudflare after rollback upload succeeds.
- Verify key routes after rollback.

## Post-Deploy Verification Checklist

For each domain:

- open `/`
- open primary rental route
- open `/contact`
- open `/sitemap.xml`
- open `/robots.txt`
- view source and confirm canonical URL
- submit a test form only against a configured staging-safe endpoint
- confirm Cloudflare cache state is expected
- record verification results in the release notes
