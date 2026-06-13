# Scoped Isolated Staging Deployment Result

Status: passed.

Exactly one deployment attempt was executed.

Command shape:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy "<validated-artifact-root>" --env production
```

Validated artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612235412/repo/apps/ice-rink-web/out
```

Result:

| Field | Value |
| --- | --- |
| Attempt count | `1` |
| Deployment result | success |
| Target default host reported by CLI | `https://kind-island-0a85a740f.7.azurestaticapps.net` |
| Broad retry | `false` |
| Deployment token source | `SWA_CLI_DEPLOYMENT_TOKEN` process environment |
| Token value printed or passed on command line | `false` |

The SWA CLI emitted a warning that it found a legacy `routes.json` file under unrelated generated `.tmp` evidence and ignored it. The deployment still completed successfully to the isolated default hostname.

No deployment to `swa-ice-static-staging`, no deployment to a production custom-domain target, and no Azure infrastructure configuration mutation occurred beyond the approved static artifact deployment to the existing isolated target.
