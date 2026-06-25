# Isolated Staging Target Verification

Approved isolated target:

| Field | Value |
| --- | --- |
| Static Web App | `swa-ice-static-isolated-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `kind-island-0a85a740f.7.azurestaticapps.net` |
| Production-bound target excluded | `swa-ice-static-staging` |

Boolean-only checks:

- `SWA_CLI_DEPLOYMENT_TOKEN` present: true
- Isolated target name present and matched: true
- Isolated resource group present and matched: true
- Production-bound target name present and matched the blocked production-bound app: true
- Isolated token target confirmation present: true
- Confirmation mentioned the isolated target only: true
- Approved isolated contact POST count matched `1`: true

No token value was printed, listed, reset, or passed on the command line.
