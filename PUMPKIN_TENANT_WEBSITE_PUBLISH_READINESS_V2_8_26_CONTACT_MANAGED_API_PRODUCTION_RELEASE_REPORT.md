# V2.8.26 Contact Managed API Production Release Report

Date: 2026-06-26

## Phase Status

Status: completed and production verified.

Lane: V2.8 Tenant Website / Post-Release Contact Verification

Classification: contact_managed_api_production_release_live_post_verification

V2.8.26 deployed the V2.8.25-proven Azure Functions v3-compatible `function.json` managed API package exactly once to the production-bound Static Web App `swa-ice-static-staging` in `rg-ice-static-staging`. Production `/contact` remained wired to `/api/static-contact`, production `/api/static-contact-health` returned 200 with `ok: true`, and exactly one synthetic non-PII production POST to `/api/static-contact` returned 200 with `ok: true` and an entry ID.

## V2.8.25 Carryforward

V2.8.25 proved the clean compatibility package on isolated staging:

- `GET /api/static-contact-health`: 200, `ok: true`, `programmingModel: azure-functions-v3-function-json`
- `OPTIONS /api/static-contact`: 204
- Exactly one isolated synthetic POST: 200, `ok: true`
- Isolated entry ID: `ice-rink-rentals-default-quote-request-3dd6171a-62ef-48bb-9f7a-029759ac71ba`
- Isolated trace: `v2-8-25-isolated-contact-20260626092010`

## Production Target Verification

Verified read-only through Azure Static Web Apps metadata:

- Production-bound target: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`

The excluded isolated target remained `swa-ice-static-isolated-staging`, default hostname `kind-island-0a85a740f.7.azurestaticapps.net`, with no custom domains.

## Local Contact Validation

Passed before production deploy:

- `npm run check` in `deployment/static-azure/forms/static-form-endpoint-compat`
- `npm test` in `deployment/static-azure/forms/static-form-endpoint-compat`
- `npm run type-check` in `apps/ice-rink-web`
- `npm run validate:static:ice` in `apps/ice-rink-web`
- `npm run build:static:ice:sanitized` in `apps/ice-rink-web`

The static validation retained the known 34 content workflow warnings and no blocking errors.

## Static Artifact Endpoint Verification

Fresh sanitized build:

- Run ID: `sanitized_20260626142333`
- Protected config copied: false
- Protected config reference in output: false

Production package:

- Root: `apps/ice-rink-web/.tmp/v2-8-26-production-swa-package/package_20260626142333`
- App files: 42
- API files: 13
- `app/contact/index.html` contains `/api/static-contact`: true
- `app/contact/index.html` contains `/api/contact`: false
- `app/contact/index.html` contains `contact@iceskatingrinkrentals.com`: true
- `app/staticwebapp.config.json platform.apiRuntime`: `node:20`
- API programming model: `azure-functions-v3-function-json`

## Production App Plus API Deployment

Deployment attempts sent: 1.

Deployment result: succeeded.

Command shape:

```powershell
npx --yes @azure/static-web-apps-cli@2.0.9 deploy app --api-location api --api-language node --api-version 20 --swa-config-location app --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain
```

The CLI deployed front-end files from `app`, API files from `api`, found `app/staticwebapp.config.json`, and reported deployment to `https://happy-mud-0b375e20f.7.azurestaticapps.net`.

## Production Verification

Contact page:

- Endpoint: `https://iceskatingrinkrentals.com/contact`
- Status: 200
- Contains `/api/static-contact`: true
- Contains `/api/contact`: false
- Contains `contact@iceskatingrinkrentals.com`: true

Health endpoint:

- Endpoint: `https://iceskatingrinkrentals.com/api/static-contact-health`
- Status: 200
- Body parse OK: true
- Success flag: true
- `programmingModel`: `azure-functions-v3-function-json`

Method check:

- Endpoint: `https://iceskatingrinkrentals.com/api/static-contact`
- Method: OPTIONS
- Status: 204
- Result: route accepted the method check

Production POST:

- Sent count: 1
- Retry sent: false
- Endpoint: `https://iceskatingrinkrentals.com/api/static-contact`
- Trace ID: `v2-8-26-production-contact-20260626101926`
- Payload class: synthetic non-PII
- Status: 200
- Body parse OK: true
- Success flag: true
- Entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

## Backend Delivery Confirmation

Backend provider or inbox delivery is pending operator confirmation. This phase did not access inbox/provider systems, read protected config, read app settings, or inspect secrets. The production API accepted the request and returned an entry ID; downstream delivery confirmation remains separately gated.

## Security Boundary

No isolated deployment occurred. No second production deployment occurred. No second production POST occurred. No DNS/custom-domain mutation, app settings mutation, Search Console/indexing action, sitemap submission, URL Inspection API call, Google Indexing API call, protected config read, deployment token print/list/export/reset, keys/listKeys, connection string generation, SAS generation, Azure media mutation, or backend provider login occurred.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-26-contact-managed-api-production-remediation-release-result/`

Next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-26-contact-managed-api-production-remediation-release-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_26_CONTACT_MANAGED_API_PRODUCTION_RELEASE_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-26-contact-managed-api-production-remediation-release-result/
git commit -m "Verify V2.8.26 contact managed API production release"
```
