# V2.8.22 Contact Static Endpoint Remediation Report

Date: 2026-06-25

## Phase Status

Status: completed with isolated staging API route blocker.

Lane: V2.8 Tenant Website / Post-Release Contact Verification

Classification: contact_static_endpoint_remediation_isolated_staging_verification

V2.8.22 remediated the recovered public contact form source so Ice static builds serialize `/api/static-contact` instead of depending on a static-exported Next API route. Local function tests, Ice type-check, static validation, sanitized static build, contact artifact checks, isolated target checks, and one isolated deployment were completed. The single approved isolated POST returned HTTP 404 with an empty body, so no retry occurred and production remains blocked.

## V2.8.21 Carryforward

V2.8.21 found that static export excluded the Next `/api/contact` route and the selected production artifact had no configured static form endpoint. The deployable static function scaffold targets `/api/static-contact` and intentionally does not deploy `/api/contact` compatibility.

## Remediation Result

Implemented:

- Ice static mode defaults to `/api/static-contact`.
- Runtime CMS mode remains `/api/contact`.
- Validators accept `/api/static-contact` as an approved same-origin SWA API path.
- The static function package accepts the isolated staging origin.
- The API deployment package excludes `.env*` and `local.settings*`.

The sanitized `/contact` artifact serialized `/api/static-contact`, preserved `contact@iceskatingrinkrentals.com`, and did not serialize `/api/contact` as the static endpoint.

## Local Validation

Passed:

- Static function `npm run check`.
- Static function `npm test`.
- Ice `npm run type-check`.
- Ice `npm run validate:static:ice`, with 34 existing warnings.
- Ice sanitized static build `sanitized_20260625222736`.
- Contact artifact endpoint verification.
- API-aware isolated readiness wrapper.

Strict static output and staging package validators now pass the static form gate, but still fail on the known non-contact legacy media-origin validator policy carried forward from V2.8.21/V2.8.19H.

## Isolated Deployment

Exactly one deployment was sent to:

- `swa-ice-static-isolated-staging`
- `rg-ice-static-staging`
- `https://kind-island-0a85a740f.7.azurestaticapps.net`

The command used pinned SWA CLI `2.0.9`, included `--api-location api`, and supplied the deployment token only through `SWA_CLI_DEPLOYMENT_TOKEN`.

## Isolated Contact Page Preflight

`GET https://kind-island-0a85a740f.7.azurestaticapps.net/contact` returned HTTP 200. The response contained `/api/static-contact` and `contact@iceskatingrinkrentals.com`, and did not serialize `/api/contact` as the static endpoint.

## Isolated Contact POST

Exactly one synthetic isolated POST was sent.

- Endpoint: `https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`
- Trace ID: `v2-8-22-isolated-contact-20260625181642`
- Status: `404`
- Body: empty
- Success flag: none
- Entry ID: none
- Retry sent: false

Interpretation: the frontend source and artifact are remediated, but the SWA managed API route was not live after deployment.

## Production Gate

No production deploy occurred. No production contact POST occurred. Production remains blocked until a future isolated-only phase fixes and proves the SWA API route.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-22-contact-static-endpoint-remediation-isolated-staging-result/`

Next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-22-contact-static-endpoint-remediation-isolated-staging-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_22_CONTACT_STATIC_ENDPOINT_REMEDIATION_REPORT.md
git add apps/ice-rink-web/src/lib/render-mode.ts
git add apps/ice-rink-web/scripts/static-publish.mjs
git add deployment/static-azure/validate-static-output.mjs
git add deployment/static-azure/validate-staging-package.mjs
git add deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs
git add deployment/static-azure/forms/static-form-endpoint/.funcignore
git add deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs
git add deployment/static-azure/forms/static-form-endpoint/validate-static-form-payload.mjs
git add deployment/static-azure/forms/static-form-endpoint/test-static-form-endpoint.mjs
git add deployment/static-azure/forms/static-form-endpoint/test-azure-function-wrapper.mjs
git add deployment/architecture/tenant-website-publish-readiness/v2-8-22-contact-static-endpoint-remediation-isolated-staging-result/
git commit -m "Remediate V2.8.22 contact static endpoint"
```
