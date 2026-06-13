# Deployment Auth Readiness Result

Status: blocked before corrective retry.

| Check | Result |
| --- | --- |
| `SWA_CLI_DEPLOYMENT_TOKEN` presence in PowerShell | present, boolean only |
| `SWA_CLI_DEPLOYMENT_TOKEN` presence in Node | present, boolean only |
| Token value printed | no |
| Token value listed | no |
| Token value exported | no |
| Token value written to docs | no |
| Protected config read for token | no |
| `.env.local` read/print/copy/move/rename/parse/source/modify | no |
| Dry-run token validity | invalid |

Dry-run failure text:

```text
deployment_token provided was invalid
```

The operator assertion that the token belongs to `swa-ice-static-staging` could not be reconciled with the deployment client's dry-run result. The token target is therefore ambiguous/invalid by process evidence, and the corrective retry remains blocked.
