# Deployment Auth Readiness Result

Status: passed.

| Check | Result |
| --- | --- |
| Required env var | `SWA_CLI_DEPLOYMENT_TOKEN` |
| PowerShell presence check | present |
| Node presence check | present |
| Operator target confirmation | token is for `swa-ice-static-staging` |
| Token value printed | `false` |
| Token value exported/listed/logged/written | `false` |
| Protected config read for credential | `false` |

No `.env.local`, protected config, SWA secret listing, Key Vault secret query, keys/listKeys, connection string, or SAS command was used.

