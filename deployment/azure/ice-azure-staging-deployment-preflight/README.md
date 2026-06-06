# Ice Azure Staging Deployment Preflight

Generated: 2026-06-06

## Result

Azure staging deployment preflight is complete.

Chosen path: Azure Static Web Apps staging for Ice only, default hostname first, using a prebuilt static artifact.

Exact future target:

| Item | Value |
| --- | --- |
| hosting option | Azure Static Web Apps |
| option decision | Option A selected by user |
| site | IceSkatingRinkRentals.com |
| site key | `ice-rink-rentals` |
| Azure Static Web App name | `swa-ice-rink-rentals-staging` |
| resource group | `rg-pumpkin-static-staging` |
| region | `eastus`, unless the deployment approval chooses a different region |
| first validation host | Azure-generated default hostname |
| custom staging domain | not in first deployment; later optional `ice-dev.iceskatingrinkrentals.com` or `staging.iceskatingrinkrentals.com` |
| static package root | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` |

No Azure resource creation, Static Web App creation, deployment, DNS change, Cloudflare change, CMS write, MediaAsset write, Function App setting change, endpoint redeployment, email sending, Microsoft 365 change, protected config read, generated artifact staging, or Roller work occurred.

Selecting Option A does not approve resource creation or deployment. It locks the staging path for the next explicit approval.

## Current Gate

| Gate | Status |
| --- | --- |
| official fresh CMS-backed export verified | yes |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| contact form production readiness | yes for the approved endpoint/config |
| static output quality gates | yes |
| Azure staging deployment preflight | yes |
| Azure staging readiness | no, deployment still requires approval |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Files

- `CURRENT_READINESS_INPUTS.md`
- `AZURE_DISCOVERY_RESULT.md`
- `STAGING_TARGET_OPTIONS.md`
- `RECOMMENDED_STAGING_PATH.md`
- `STAGING_PACKAGE_REQUIREMENTS.md`
- `REQUIRED_ENVIRONMENT_PLACEHOLDERS.md`
- `STAGING_SMOKE_TEST_PLAN.md`
- `STAGING_VALIDATION_PLAN.md`
- `ROLLBACK_PLAN.md`
- `APPROVAL_REQUIRED_BEFORE_STAGING_DEPLOYMENT.md`
- `NEXT_STAGING_DEPLOYMENT_PROMPT.md`
- `manifest.json`
