# SWA CLI App Plus API Command Shape

Command used for the single V2.8.23 isolated deployment:

```powershell
cd apps/ice-rink-web/.tmp/v2-8-23-isolated-swa-package/package_20260625190621
npx --yes @azure/static-web-apps-cli@2.0.9 deploy app --api-location api --api-language node --api-version 20 --swa-config-location app --app-name "swa-ice-static-isolated-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain
```

The deployment token was supplied only by `SWA_CLI_DEPLOYMENT_TOKEN`.

No `--deployment-token`, `--print-token`, `az staticwebapp secrets list`, `listKeys`, or token reset command was used.

Next candidate command shape, not run in V2.8.23:

```powershell
cd apps/ice-rink-web/.tmp/v2-8-23-isolated-swa-package-next-candidate/package_20260625191247
npx --yes @azure/static-web-apps-cli@2.0.9 deploy app --api-location api --api-language node --api-version 20 --swa-config-location app --app-name "swa-ice-static-isolated-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain
```

