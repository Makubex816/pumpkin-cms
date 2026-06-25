# SWA CLI and Token Readiness Result

Result: pass.

SWA CLI:

- Command: `npx --yes @azure/static-web-apps-cli@2.0.9 --version`
- Observed version: `2.0.9`

PowerShell boolean-only token readiness:

- `SWA_CLI_DEPLOYMENT_TOKEN` present: true
- Isolated target name present: true
- Isolated target name matches `swa-ice-static-isolated-staging`: true
- Isolated resource group present: true
- Isolated resource group matches `rg-ice-static-staging`: true
- Production-bound target name present: true
- Production-bound target name matches `swa-ice-static-staging`: true
- Isolated token target confirmation present: true
- Confirmation matches `operator-confirmed-token-for-swa-ice-static-isolated-staging-only`: true
- Token value printed: false

Node boolean-only token readiness:

- `SWA_CLI_DEPLOYMENT_TOKEN` present: true
- Isolated target name present: true
- Isolated target name matches `swa-ice-static-isolated-staging`: true
- Isolated resource group present: true
- Isolated resource group matches `rg-ice-static-staging`: true
- Production-bound target name present: true
- Production-bound target name matches `swa-ice-static-staging`: true
- Isolated token target confirmation present: true
- Confirmation matches `operator-confirmed-token-for-swa-ice-static-isolated-staging-only`: true
- Token value printed: false

No deployment token was printed, listed, exported, reset, or retrieved.
