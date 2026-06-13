# Deployment Auth Readiness Result

Status: passed for deployment attempt.

| Check | Result |
| --- | --- |
| `SWA_CLI_DEPLOYMENT_TOKEN` presence in PowerShell | present, boolean only |
| `SWA_CLI_DEPLOYMENT_TOKEN` presence in Node | present, boolean only |
| `EnvTokenMatchesCurrentTargetToken` for `swa-ice-static-staging` | carried forward as already proven true by approval context |
| Token value printed | no |
| Token value listed | no |
| Token value exported | no |
| Token value written to docs | no |
| Protected config read for token | no |
| `.env.local` read/print/copy/move/rename/parse/source/modify | no |
| `az staticwebapp secrets list` | not run |
| `az staticwebapp secrets reset-api-key` | not run |

The token value is intentionally absent from this package.

