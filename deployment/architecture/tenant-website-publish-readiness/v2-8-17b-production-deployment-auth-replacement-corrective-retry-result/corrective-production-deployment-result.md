# Corrective Production Deployment Result

Status: failed; no retry remaining.

Exactly one corrective production deployment attempt was sent.

| Field | Value |
| --- | --- |
| Target | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613140129/repo/apps/ice-rink-web/out` |
| SWA CLI version | `2.0.9` |
| Attempt count | `1` |
| Result | `failed_exit_code_1` |
| Broad retry | `false` |
| Second corrective retry | `false` |

Command shape:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --env production --swa-config-location .
```

Observed failure summary:

```text
Deployment failed with exit code 1
The deployment binary exited with code 1.
```

The token was not passed on the command line and its value was not printed or written.

