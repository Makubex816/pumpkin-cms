# V2.8.19H Production Release Execution Report

Date: 2026-06-25

## Phase Status

Status: complete.

Lane: V2.8 Tenant Website / Public Website Regression Recovery

Classification: production_bound_release_execution_owner_approved

Owner approval was recorded from the execution prompt: the owner reviewed the isolated staging pages and approved them being live.

## Carryforward

Reviewed:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19G_ISOLATED_STAGING_PREVIEW_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-19g-isolated-staging-preview-deployment-runtime-qa-result/`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19F_EXISTING_AZURE_MEDIA_SOURCE_INTEGRATION_REPORT.md`

V2.8.19G carryforward: isolated staging deployed exactly once to `swa-ice-static-isolated-staging`, runtime QA passed for `/`, `/service-areas`, and `/contact`, public email was `contact@iceskatingrinkrentals.com`, and existing Azure Blob media rendered from `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`.

## Target Classification

Production-bound target verified by read-only Azure Static Web Apps metadata:

- App: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`
- Custom domains: `iceskatingrinkrentals.com` Ready, `www.iceskatingrinkrentals.com` Ready

Excluded isolated staging target:

- App: `swa-ice-static-isolated-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Custom domains: none

## Local Validation and Artifact

One tiny validation/source fix was made before deployment:

- `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts`: recovered page SEO robots changed from `noindex, nofollow` to `index, follow`.

Validation:

- `npm run validate:static:ice`: pass with known 34 warnings.
- `npm run type-check`: pass.
- `npm run build:static:ice:sanitized`: pass.
- Protected config copied by sanitized build: false.
- Protected config references reported by sanitized build: false.

Selected artifact:

- Run ID: `sanitized_20260625063439`
- Path: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625063439/repo/apps/ice-rink-web/out`
- File count: 41
- Total bytes: 2,219,077
- Aggregate SHA-256: `a7adb1cb7f3779c6e3232fe0f5e65886de62cdb60e89dffb44ef3c470cba3119`

## Media and Email

- Source expected Azure Blob URLs: 9.
- Static output unique Azure Blob URLs: 8.
- Expected source URL not rendered: `iceskatingrinkrentalslogo-0d1f970f0411.png`, matching V2.8.19G carryforward.
- Exact known Azure Blob HEAD checks: 9 of 9 returned `200 image/png`.
- Local media references in selected route output: 0.
- Repo-local image binaries required: 0.
- Public email in source: 3 occurrences.
- Public email in selected static output: 13 occurrences.
- Static output mailto occurrences: 1.

## Deployment

SWA CLI and token readiness:

- SWA CLI: `2.0.9`
- PowerShell boolean-only readiness: pass.
- Node boolean-only readiness: pass.
- Production token target confirmation matched: true.
- Token value was not printed, listed, exported, reset, or persisted.

Production deployment:

- Attempts sent: 1.
- Target: `swa-ice-static-staging` in `rg-ice-static-staging`.
- Result: success.
- Reported endpoint: `https://happy-mud-0b375e20f.7.azurestaticapps.net`.
- Retry count: 0.

## Production Route Checks

Exactly six approved production-domain GET checks were performed. All returned 200 and contained expected recovered content, public email evidence, Azure Blob media references, and `index, follow` robots metadata.

- `https://iceskatingrinkrentals.com/`: 200
- `https://iceskatingrinkrentals.com/service-areas`: 200
- `https://iceskatingrinkrentals.com/contact`: 200
- `https://www.iceskatingrinkrentals.com/`: 200
- `https://www.iceskatingrinkrentals.com/service-areas`: 200
- `https://www.iceskatingrinkrentals.com/contact`: 200

## Hard Stops

Confirmed:

- No deployment to `swa-ice-static-isolated-staging`.
- No second production deployment attempt.
- No DNS mutation.
- No custom-domain mutation.
- No Search Console/indexing action.
- No Azure media upload or mutation.
- No SWA config mutation.
- No protected config read.
- No deployment token print/list/export/reset.
- No contact form POST.
- No production crawl beyond the six approved GET checks.
- No files staged.

Closeout checks:

- `result-manifest.json` parse: pass.
- `node --check` for V2.8.19H JS/MJS changes: not applicable.
- `git diff --check`: pass with existing busy-worktree line-ending warnings only.
- Scoped trailing whitespace scan: pass.
- Scoped secret-like scan: pass.
- Deploy-target guard: pass.
- Protected/generated/raw path guard: pass.
- Final staged-file check: empty.

## Result Package

Created:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-19h-production-bound-release-execution-result/`

Next prompt:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-19h-production-bound-release-execution-result/next-phase-prompt.md`

Commit instructions are exact-path only:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19H_PRODUCTION_RELEASE_EXECUTION_REPORT.md
git add apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts
git add deployment/architecture/tenant-website-publish-readiness/v2-8-19h-production-bound-release-execution-result/
git commit -m "Complete V2.8.19H production-bound release execution"
```
