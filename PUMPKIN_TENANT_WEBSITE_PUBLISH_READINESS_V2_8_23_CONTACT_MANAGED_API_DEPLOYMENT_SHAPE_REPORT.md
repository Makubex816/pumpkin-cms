# V2.8.23 Contact Managed API Deployment Shape Report

Date: 2026-06-25

## Phase Status

Status: completed with isolated API POST blocker.

Lane: V2.8 Tenant Website / Post-Release Contact Verification

Classification: contact_managed_api_deployment_shape_isolated_staging_verification

V2.8.23 corrected the SWA app plus API package shape enough to include `staticwebapp.config.json`, `node:20` API runtime metadata, API package lock metadata, and a single app plus API deployment to `swa-ice-static-isolated-staging`. The isolated page still served correctly, but the single approved synthetic POST to `/api/static-contact` returned HTTP 404 with an empty body. No retry was sent.

## V2.8.22 Carryforward

V2.8.22 proved the static frontend fix: `/contact` serialized `/api/static-contact` and did not rely on static-exported Next `/api/contact`. The remaining blocker was that the managed API route was not live after isolated deployment.

## API Deployment Shape Root Cause

The deployed app output needed `staticwebapp.config.json` with `platform.apiRuntime=node:20`, and the API package needed deterministic Functions package metadata. V2.8.23 added those and deployed once. The POST still returned 404, so the remaining likely issue is trigger discovery of the ESM root entrypoint (`main=azure-function-static-contact.mjs`) inside SWA managed Functions.

After the no-retry POST result, a local-only next-candidate fix was prepared: `package.json main=src/functions/static-contact.js` with a CommonJS Azure Functions v4 registration wrapper. It passed local readiness but was not deployed in V2.8.23.

## Command Shape

The single isolated deployment used:

```powershell
npx --yes @azure/static-web-apps-cli@2.0.9 deploy app --api-location api --api-language node --api-version 20 --swa-config-location app --app-name "swa-ice-static-isolated-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain
```

The deployment token came only from `SWA_CLI_DEPLOYMENT_TOKEN` and was not printed.

## Local Validation

Passed:

- Static function `npm run check`.
- Static function `npm test`.
- Ice `npm run type-check`.
- Ice `npm run validate:static:ice`, with 34 existing warnings.
- Ice sanitized static build `sanitized_20260625230507`.
- Contact artifact endpoint verification.
- Deployed-package readiness wrapper.
- Next-candidate readiness wrapper.

Strict static/staging validators passed the static form gate but failed on 165 known non-contact media-origin policy findings.

## Isolated Verification

- Isolated target: `swa-ice-static-isolated-staging`, `rg-ice-static-staging`.
- Isolated default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`.
- Isolated custom domains: none.
- Deployment attempts sent: 1.
- `/contact` GET: 200.
- `/contact` contained `/api/static-contact`: true.
- `/contact` contained `/api/contact`: false.
- `/contact` contained `contact@iceskatingrinkrentals.com`: true.
- `/api/static-contact` OPTIONS: 204.
- `/api/static-contact` POST: 404, empty body.
- Trace ID: `v2-8-23-isolated-contact-20260625185951`.
- POST retry sent: false.

## Production Gate

No production deploy occurred. No production contact POST occurred. No DNS/custom-domain mutation occurred. No protected config was read.

Production remains blocked until a future isolated-only phase deploys the CommonJS next-candidate API shape and proves the isolated POST succeeds.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-23-contact-managed-api-deployment-shape-isolated-staging-result/`

Next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-23-contact-managed-api-deployment-shape-isolated-staging-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_23_CONTACT_MANAGED_API_DEPLOYMENT_SHAPE_REPORT.md
git add apps/ice-rink-web/scripts/static-publish.mjs
git add deployment/static-azure/validate-static-output.mjs
git add deployment/static-azure/validate-staging-package.mjs
git add deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs
git add deployment/static-azure/forms/static-form-endpoint/package.json
git add deployment/static-azure/forms/static-form-endpoint/package-lock.json
git add deployment/static-azure/forms/static-form-endpoint/src/functions/static-contact.js
git add deployment/static-azure/forms/static-form-endpoint/README.md
git add deployment/static-azure/forms/static-form-endpoint/DEPLOYMENT_INSTRUCTIONS.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-23-contact-managed-api-deployment-shape-isolated-staging-result/
git commit -m "Record V2.8.23 contact managed API deployment shape"
```
