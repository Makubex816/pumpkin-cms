# Deployment Auth Replacement Result

Status: passed for precondition; deployment later failed.

| Check | Result |
| --- | --- |
| `SWA_CLI_DEPLOYMENT_TOKEN` presence in PowerShell | present, boolean only |
| `SWA_CLI_DEPLOYMENT_TOKEN` presence in Node | present, boolean only |
| Operator confirmed replacement token target | yes |
| Confirmed target | `swa-ice-static-staging` |
| Confirmed resource group | `rg-ice-static-staging` |
| Token value printed | no |
| Token value listed | no |
| Token value exported | no |
| Token value written to docs | no |
| Protected config read for token | no |
| `.env.local` read/print/copy/move/rename/parse/source/modify | no |

The token value is intentionally absent from this package.

