# V2.8.25 Contact Managed API Discovery Sentinel Report

Date: 2026-06-26

## Phase Status

Status: completed and verified on isolated staging.

Lane: V2.8 Tenant Website / Post-Release Contact Verification

Classification: contact_managed_api_discovery_sentinel_isolated_staging_verification

V2.8.25 deployed a clean Azure Functions v3-compatible `function.json` managed API package exactly once to `swa-ice-static-isolated-staging`. The new sentinel health route `/api/static-contact-health` returned 200 with `ok: true`, and the single approved synthetic isolated POST to `/api/static-contact` returned 200 with `ok: true`.

## V2.8.24 Carryforward

V2.8.24 deployed the CommonJS Azure Functions v4 entrypoint candidate exactly once to isolated staging. `/contact` still pointed to `/api/static-contact`, and `OPTIONS /api/static-contact` returned 204, but the single approved POST returned 404 with an empty body for trace `v2-8-24-isolated-contact-20260625211731`.

That carried forward the question of whether managed API discovery was failing generally or only for the v4 package shape.

## Managed API Discovery Strategy

The phase switched the deployed API package to a clean compatibility package at `deployment/static-azure/forms/static-form-endpoint-compat`.

The package uses one programming model only:

- Azure Functions v3-compatible `function.json` discovery.
- `static-contact-health/function.json` plus `index.js` for GET `/api/static-contact-health`.
- `static-contact/function.json` plus `index.js` for OPTIONS/POST `/api/static-contact`.
- No `@azure/functions` dependency.
- No v4 `app.http` registration files in the deployed package.

## API Programming Model Decision

Decision: use the v3-compatible `function.json` model for the isolated discovery sentinel.

Reason: the v4 package looked locally correct in V2.8.23 and V2.8.24 but still returned 404 after deployment. A v3-compatible package provides the simplest SWA managed API discovery proof without mixing programming models.

## Sentinel API Package Result

Created:

- `deployment/static-azure/forms/static-form-endpoint-compat/`

Packaged:

- `apps/ice-rink-web/.tmp/v2-8-25-isolated-swa-package/package_20260626092703/api`

Readiness result:

- App files: 42
- API files: 13
- Health route: `/api/static-contact-health`
- Contact route: `/api/static-contact`
- Programming model: `azure-functions-v3-function-json`
- v4 markers in packaged compat API: none found

## Local Validation

Passed:

- `npm run check` in `deployment/static-azure/forms/static-form-endpoint-compat`
- `npm test` in `deployment/static-azure/forms/static-form-endpoint-compat`
- `npm run check` in `deployment/static-azure/forms/static-form-endpoint`
- `npm test` in `deployment/static-azure/forms/static-form-endpoint`
- `node --check deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs`
- `npm run type-check` in `apps/ice-rink-web`
- `npm run validate:static:ice` in `apps/ice-rink-web`, with 34 existing content warnings
- `npm run build:static:ice:sanitized` in `apps/ice-rink-web`

Sanitized build:

- Run ID: `sanitized_20260626132555`
- Protected config copied: false
- Protected config reference in command output: false

## Static Artifact Endpoint Verification

Artifact:

- `apps/ice-rink-web/.tmp/v2-8-25-isolated-swa-package/package_20260626092703/app/contact/index.html`

Result:

- Contains `/api/static-contact`: true
- Contains `/api/contact`: false
- Contains `contact@iceskatingrinkrentals.com`: true
- `staticwebapp.config.json platform.apiRuntime`: `node:20`

## Isolated Deployment

Target:

- App: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Custom domains: none

Production-bound target was verified separately and excluded:

- App: `swa-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`

Deployment attempts sent: 1.

Deployment result: succeeded.

## Isolated Verification

After deployment:

- `GET https://kind-island-0a85a740f.7.azurestaticapps.net/contact`: 200
- `/contact` contains `/api/static-contact`: true
- `/contact` contains `/api/contact`: false
- `/contact` contains `contact@iceskatingrinkrentals.com`: true
- `GET https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health`: 200
- Health body `ok`: true
- Health body `programmingModel`: `azure-functions-v3-function-json`
- `OPTIONS https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`: 204
- `POST https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`: 200
- POST success flag: true
- Entry ID: `ice-rink-rentals-default-quote-request-3dd6171a-62ef-48bb-9f7a-029759ac71ba`
- Trace ID: `v2-8-25-isolated-contact-20260626092010`
- POST retry sent: false

Conclusion: Azure Static Web Apps managed API discovery works on isolated staging with the v3-compatible package. The V2.8.24 failure is isolated to the v4 discovery/package shape, not to the contact handler or managed API deployment generally.

## Production Remediation Gate

Production remediation is still not approved. The next production remediation release should deploy the proven v3-compatible contact API package to the production-bound SWA only after explicit approval, then verify production health before any production contact POST is considered.

No production deployment occurred. No production contact POST occurred.

## Security Boundary

No DNS/custom-domain mutation, Search Console/indexing action, protected-config read, app-settings mutation, token listing/reset/export, keys/listKeys, connection string generation, SAS generation, or inbox/provider access occurred.

The deployment token was supplied only through the existing `SWA_CLI_DEPLOYMENT_TOKEN` process environment variable and was never printed.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-25-contact-managed-api-discovery-sentinel-result/`

Next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-25-contact-managed-api-discovery-sentinel-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_25_CONTACT_MANAGED_API_DISCOVERY_SENTINEL_REPORT.md
git add deployment/static-azure/forms/static-form-endpoint-compat/
git add deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs
git add deployment/architecture/tenant-website-publish-readiness/v2-8-25-contact-managed-api-discovery-sentinel-result/
git commit -m "Verify V2.8.25 contact managed API discovery sentinel"
```
