# V2.8.19G Isolated Staging Preview Deployment Report

Date: 2026-06-25

## Phase Status

Status: complete.

Lane: V2.8 Tenant Website / Public Website Regression Recovery

Classification: isolated_staging_preview_deployment_runtime_qa_no_production_deploy

V2.8.19G built the recovered IceSkatingRinkRentals.com public website from current source, corrected the static seed-site render path so the sanitized artifact contains the V2.8.19F recovered routes, deployed exactly once to the isolated staging Static Web App, and verified the three approved routes on the isolated default host.

## V2.8.19F Carryforward

Reviewed:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19F_EXISTING_AZURE_MEDIA_SOURCE_INTEGRATION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-19f-existing-azure-media-source-integration-result/`

Carryforward:

- Recovered routes: `/`, `/service-areas`, `/contact`
- Canonical public email: `contact@iceskatingrinkrentals.com`
- Existing Azure media base: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`
- Existing source-mapped media URLs: 9

## Target Classification

Isolated staging target:

- `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Custom domains: none

Production-bound target:

- `swa-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- Classification: production-bound, not approved, not targeted

## Local Build and Artifact

Validation:

- `npm run validate:static:ice`: pass with existing 34 warnings.
- `npm run type-check`: pass.
- `npm run build:static:ice:sanitized`: pass.

Scoped source fix:

- `apps/ice-rink-web/src/lib/content-source.ts` now prefers the recovered Ice page builders for seed-site static rendering of `/`, `/service-areas`, and `/contact`.

Selected artifact:

- Run ID: `sanitized_20260625060958`
- Path: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625060958/repo/apps/ice-rink-web/out`
- File count: 41
- Total bytes: 2,219,129
- Aggregate SHA-256: `4c0f5e7babc104c8223ddfdc37d95dd863190796db809544d4e9e3acf44e9897`

Artifact route/content validation passed for `/`, `/service-areas`, and `/contact`.

## Media and Contact Validation

Image references:

- Source mapped Azure URLs: 9
- Static output unique Azure URLs: 8
- Mapped but not rendered: `iceskatingrinkrentalslogo-0d1f970f0411.png`
- Exact known Azure Blob HEAD checks: 9 of 9 returned 200 `image/png`
- Local media references in selected output: 0
- Repo-local image binaries required: 0

Public email:

- Canonical email: `contact@iceskatingrinkrentals.com`
- Selected output occurrences: 13
- Selected output mailto occurrences: 1

## SWA CLI and Token Readiness

- SWA CLI version: `2.0.9`
- PowerShell boolean-only token readiness: pass
- Node boolean-only token readiness: pass
- `PUMPKIN_SWA_ISOLATED_TOKEN_TARGET_CONFIRMATION` matched `operator-confirmed-token-for-swa-ice-static-isolated-staging-only`
- Token value was not printed, listed, exported, or reset.

## Deployment Result

Deployment attempts sent: 1.

Deployment target:

- `swa-ice-static-isolated-staging`
- `rg-ice-static-staging`

Deployment result: success.

Preview URL:

- `https://kind-island-0a85a740f.7.azurestaticapps.net`

The SWA CLI reported an unrelated legacy generated `routes.json` under a `.tmp` path and said it was ignored. No retry was sent.

## Runtime QA

Bounded isolated staging GET checks:

- `https://kind-island-0a85a740f.7.azurestaticapps.net/`: 200
- `https://kind-island-0a85a740f.7.azurestaticapps.net/service-areas`: 200
- `https://kind-island-0a85a740f.7.azurestaticapps.net/contact`: 200

All three route responses contained expected recovered content and public contact email evidence.

## Hard Stops

Confirmed:

- No deployment to `swa-ice-static-staging`.
- No production-domain route checks.
- No DNS mutation.
- No custom-domain mutation.
- No Search Console/indexing.
- No Azure media upload or mutation.
- No contact form POST.
- No protected config content read.
- No deployment token print/list/export/reset.
- No files staged.

Closeout checks:

- `result-manifest.json` parse: pass.
- `git diff --check`: pass with existing busy-worktree line-ending warnings only.
- Scoped trailing whitespace scan: pass.
- Scoped secret-like scan: pass.
- Deploy-target manifest scan: pass, isolated target only.
- Protected/generated/raw path guard for result package: pass.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-19g-isolated-staging-preview-deployment-runtime-qa-result/`

Next approval prompt:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-19g-isolated-staging-preview-deployment-runtime-qa-result/next-phase-prompt.md`

Next gate: owner visual/content review and isolated staging signoff only.
