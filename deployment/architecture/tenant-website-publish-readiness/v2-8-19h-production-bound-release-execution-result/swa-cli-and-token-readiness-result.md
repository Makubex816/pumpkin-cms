# SWA CLI and Token Readiness Result

Result: pass.

SWA CLI:

- Command: `npx --yes @azure/static-web-apps-cli@2.0.9 --version`
- Result: `2.0.9`

PowerShell boolean-only readiness:

- `SWA_CLI_DEPLOYMENT_TOKEN` present: true.
- `PUMPKIN_SWA_PRODUCTION_TARGET_NAME` matched `swa-ice-static-staging`: true.
- `PUMPKIN_SWA_PRODUCTION_RESOURCE_GROUP` matched `rg-ice-static-staging`: true.
- `PUMPKIN_SWA_ISOLATED_EXCLUDED_TARGET_NAME` matched `swa-ice-static-isolated-staging`: true.
- `PUMPKIN_SWA_PRODUCTION_TOKEN_TARGET_CONFIRMATION` matched required confirmation: true.

Node boolean-only readiness:

- Same checks passed.

Token boundary:

- The deployment token value was not printed, listed, exported, persisted, reset, or retrieved.

