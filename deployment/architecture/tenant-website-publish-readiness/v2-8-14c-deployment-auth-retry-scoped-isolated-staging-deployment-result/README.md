# V2.8.14C Deployment Auth Retry And Scoped Isolated Staging Deployment

Status: complete; classified `blocked_before_deployment_auth_missing`.

V2.8.14C retried the isolated staging deployment boundary and stopped before deployment because `SWA_CLI_DEPLOYMENT_TOKEN` is not present in the current terminal session.

No static deployment was attempted.

Current target:

```text
swa-ice-static-isolated-staging
rg-ice-static-staging
kind-island-0a85a740f.7.azurestaticapps.net
customDomains: []
```

Required operator action:

```text
Set SWA_CLI_DEPLOYMENT_TOKEN in the same terminal session, without printing or committing the value.
```

