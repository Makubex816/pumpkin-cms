# V2.8.24 Contact Function v4 Entrypoint Report

Date: 2026-06-26

## Phase Status

Status: completed with isolated API POST blocker still open.

Lane: V2.8 Tenant Website / Post-Release Contact Verification

Classification: contact_function_v4_entrypoint_isolated_staging_post_verification

V2.8.24 deployed the prepared CommonJS Azure Functions v4 entrypoint package to isolated staging exactly once with the approved app-plus-API Static Web Apps shape. The isolated static app continued to serve `/contact` correctly and still serialized `/api/static-contact`. The approved synthetic isolated POST was sent exactly once and still returned HTTP 404 with an empty body.

## V2.8.23 Carryforward

V2.8.23 proved that the Static Web Apps app-plus-API deployment command succeeded, `staticwebapp.config.json` carried `platform.apiRuntime=node:20`, the API package included package-lock metadata, and isolated `/contact` remained correctly wired. The single V2.8.23 POST to `/api/static-contact` returned 404, pointing to function trigger discovery rather than frontend wiring.

## Function v4 Entrypoint Analysis

The API package currently uses the Node v4 programming model with:

- `package.json main=src/functions/static-contact.js`
- `src/functions/static-contact.js` using CommonJS `require('@azure/functions')`
- `app.http('static-contact', { methods: ['OPTIONS', 'POST'], authLevel: 'anonymous', route: 'static-contact' })`
- `host.json` route prefix `api`, resolving the public route to `/api/static-contact`
- `@azure/functions` in runtime dependencies

No additional source edit was required in V2.8.24 because the V2.8.23 local-only candidate was already present and passed local readiness.

## API Package Discovery Readiness

Readiness wrapper result: pass.

- App files: 42
- API files: 11
- API root included `host.json`, `package.json`, `package-lock.json`, `.funcignore`, the CommonJS v4 entrypoint, adapter, handler, validator, sanitizer, and delivery module.
- `.funcignore` excludes local settings, dotenv files, tests, samples, docs, and git metadata; it does not exclude the v4 entrypoint or package metadata.

## Local Contact Validation

Passed:

- Static form endpoint `npm run check`
- Static form endpoint `npm test`
- Ice app `npm run type-check`
- Ice app `npm run validate:static:ice`, with 34 existing content readiness warnings
- Ice sanitized static build `sanitized_20260626011945`, with protected config copied false
- Contact artifact endpoint verification
- Isolated app/API readiness wrapper

Strict static output and staging package validators kept the static form gate passing but failed on 165 known non-contact media-origin findings carried forward from prior phases.

## Isolated Deployment

Target:

- App: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Custom domains: none

Production-bound target was verified as separate and excluded:

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
- `OPTIONS https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`: 204
- `POST https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`: 404
- POST body: empty
- Success flag: not returned
- Entry ID: not returned
- Trace ID: `v2-8-24-isolated-contact-20260625211731`
- POST retry sent: false

## Production Gate

Production remediation is not approved. No production deployment occurred. No production contact POST occurred. No DNS/custom-domain mutation, Search Console/indexing action, protected-config read, app-settings mutation, token listing/reset/export, keys/listKeys, connection string generation, SAS generation, or inbox/provider access occurred.

Production remains blocked until a future isolated-only remediation proves `/api/static-contact` accepts POST successfully after deployment.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-24-contact-function-v4-entrypoint-isolated-staging-result/`

Next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-24-contact-function-v4-entrypoint-isolated-staging-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_24_CONTACT_FUNCTION_V4_ENTRYPOINT_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-24-contact-function-v4-entrypoint-isolated-staging-result/
git commit -m "Record V2.8.24 contact v4 isolated verification"
```
