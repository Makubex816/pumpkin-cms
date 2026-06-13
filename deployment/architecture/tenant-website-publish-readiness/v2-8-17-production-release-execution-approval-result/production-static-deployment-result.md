# Production Static Deployment Result

Status: failed.

Exactly one production deployment attempt was sent.

Command shape:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy "<validated-artifact-root>" --env production
```

Validated artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613014405/repo/apps/ice-rink-web/out
```

Result:

| Field | Value |
| --- | --- |
| Attempt count | `1` |
| Deployment result | failed |
| Target | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Exit code | `1` |
| Reported URL | none |
| Broad retry | `false` |
| Deployment token source | `SWA_CLI_DEPLOYMENT_TOKEN` process environment |
| Token value printed or passed on command line | `false` |

Failure summary:

```text
Deployment failed with exit code 1.
The deployment binary exited with code 1.
```

No deployment retry was attempted.

