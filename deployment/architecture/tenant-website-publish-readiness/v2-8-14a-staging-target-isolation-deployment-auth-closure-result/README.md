# V2.8.14A Staging Target Isolation And Deployment Auth Closure

Status: complete; classified `blocked_auth_missing`.

V2.8.14A resolved the target-isolation blocker by creating and verifying one isolated non-production Azure Static Web App target:

```text
swa-ice-static-isolated-staging
rg-ice-static-staging
kind-island-0a85a740f.7.azurestaticapps.net
```

The target has no custom domains. No static content was deployed.

Deployment remains blocked because the approved deployment-token environment variable is not present in the current terminal session. The repo now includes a local readiness wrapper that checks the approved target, artifact root, and auth contract without printing or reading token values.

