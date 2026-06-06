# Ice Azure Static Web App Staging Deployment Result

Generated: 2026-06-06

## Result

Ice static staging deployment to Azure Static Web Apps default hostname completed.

| Item | Value |
| --- | --- |
| deployment result | completed |
| content smoke result | passed |
| form staging-origin CORS result | resolved by later CORS enablement |
| resource group | `rg-ice-static-staging` |
| Static Web App | `swa-ice-static-staging` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| default environment status | `Ready` |
| artifact root | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` |
| deployed file count | 42 |

The default hostname serves the approved Ice routes and support files. A later approved CORS/origin enablement pass added the Azure default hostname to the static contact Function allowed-origin setting, so staging-origin OPTIONS/browser readiness now passes.

## Files

- `PRE_DEPLOYMENT_READINESS_RECHECK.md`
- `DEPLOYMENT_TARGET.md`
- `DEPLOYMENT_ARTIFACT_SCOPE.md`
- `DEPLOYMENT_RESULT.md`
- `DEFAULT_HOSTNAME_RESULT.md`
- `STAGING_SMOKE_TEST_RESULT.md`
- `VALIDATOR_RESULT.md`
- `REMAINING_STAGING_BLOCKERS.md`
- `NEXT_PRODUCTION_CUTOVER_PREFLIGHT_APPROVAL_REQUIRED.md`
- `ROLLBACK_NOTES.md`
- `manifest.json`

## Boundary

No custom domain, production deployment, production DNS cutover, root/www DNS change, Cloudflare change, CMS write, MediaAsset write, Function App setting change, endpoint redeployment, email sending, Microsoft 365 change, generated static artifact staging, or Roller work occurred.
