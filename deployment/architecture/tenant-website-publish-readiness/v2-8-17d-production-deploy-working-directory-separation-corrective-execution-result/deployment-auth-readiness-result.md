# Deployment Auth Readiness Result

Result: passed.

| Check | Result |
| --- | --- |
| Required env var | `SWA_CLI_DEPLOYMENT_TOKEN` |
| PowerShell sees required env var | `true` |
| Node sees required env var | `true` |
| Operator confirmed target ownership | `true` |
| Token reset | `0` |
| Token dry-run probe | `0` |
| Token printed/exported/listed/written/revealed | `0` |
| Protected config or `.env.local` read for credential | `0` |
| Key Vault secret query | `0` |
| Keys/listKeys, connection strings, SAS | `0` |

Only boolean presence checks and operator confirmation were used. The token value was not printed, logged, exported, listed, written, committed, or revealed.

