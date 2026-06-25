# Isolated Staging Deployment Result

Result: deployment succeeded.

Deployment attempts sent: 1.

Target:

- App: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Environment: `production` environment of the isolated SWA resource
- Default URL reported by CLI: `https://kind-island-0a85a740f.7.azurestaticapps.net`

Command shape:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy --app-location app --output-location . --api-location api --app-name "swa-ice-static-isolated-staging" --resource-group "rg-ice-static-staging" --env production --api-language node --api-version 20 --no-use-keychain
```

Deployment package:

- App files: 41
- API files: 9
- API public path expected by source: `/api/static-contact`

The deployment token was supplied only through `SWA_CLI_DEPLOYMENT_TOKEN`.
