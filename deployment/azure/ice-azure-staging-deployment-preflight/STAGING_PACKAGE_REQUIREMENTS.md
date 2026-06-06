# Staging Package Requirements

Generated: 2026-06-06

## Approved Package

Use the latest verified Ice static artifact:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Deploy the contents of that folder as the prebuilt static app root. Do not deploy the parent folder.

## Required Routes And Files

Required content routes:

- `/`
- `/contact`
- `/service-areas`

Required support files/routes:

- `404.html`
- `/404` support route if generated
- `/sitemap.xml`
- `/robots.txt`
- `redirects.json`
- `static-publish-manifest.json`
- `_next/static/`

## Required Cleanliness

The package must retain all current validator properties:

- strict static output validator passes
- strict staging package validator passes
- file count currently `42`
- no preview deployable paths
- no obsolete route folders:
  - `/ice-rink-rentals`
  - `/events-holiday-activations`
- no local `/media/ice-rink-rentals/...` strings
- no public `latestSnapshot` payload
- no rendered local `<img src="/media/...">`
- media URLs use `https://media.iceskatingrinkrentals.com`
- static form endpoint is configured and verified in the validation/build context
- no `.env` files
- no `appsettings` files
- no API keys, JWTs, deployment tokens, connection strings, or credentials in static output
- no `CMS LIVE` marker
- no localhost references
- no noindex robots meta on production-bound pages

## Current Validation Commands

Use these before a future deployment:

```powershell
$env:NEXT_PUBLIC_STATIC_FORM_ENDPOINT='https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact'
$env:STATIC_FORM_ENDPOINT='https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact'
$env:STATIC_FORM_ENDPOINT_VERIFIED='true'
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Latest preflight result: both passed with `42` files, `0` errors, and `0` warnings.

## Static Web App Config

The package can deploy without adding a config file because each route has a generated `index.html`.

If headers/404 behavior need explicit SWA configuration later, review:

```text
deployment/static-azure/staticwebapp.config.template.json
```

Copying it into the generated artifact as `staticwebapp.config.json` should happen only in the future deployment approval and must be followed by validator reruns.

## Generated Artifact Policy

Generated output must not be staged or committed:

- `apps/ice-rink-web/out`
- `apps/ice-rink-web/.static-artifacts`
- `apps/ice-rink-web/.static-content-snapshots`
- `.static-release-dry-runs`
