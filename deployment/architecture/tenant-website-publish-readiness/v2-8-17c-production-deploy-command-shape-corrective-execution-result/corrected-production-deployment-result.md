# Corrected Production Deployment Result

Status: failed; no retry remaining.

Exactly one V2.8.17C production deployment attempt was sent.

| Field | Value |
| --- | --- |
| Target | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613172317/repo/apps/ice-rink-web/out` |
| SWA CLI version | `2.0.9` |
| Attempt count | `1` |
| Result | `failed_exit_code_1` |
| Classification | `production_deployment_failed_command_shape` |
| DeploymentId | `b20c5b8a-b569-404d-a5b2-e3e3f0a5a946` |
| `SWA_CLI_DEPLOY_DRY_RUN` | `false` |
| `DEPLOYMENT_ACTION` | `upload` |
| Broad retry | `false` |
| Second corrective retry | `false` |

Command shape:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain --verbose=silly
```

Observed failure summary:

```text
Current directory cannot be identical to or contained within artifact folders.
Deployment failed with exit code 1
```

The token was not passed on the command line and its value was not printed or written.

