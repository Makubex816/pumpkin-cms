# Production App Plus API Deployment Result

Result: deployment command succeeded.

Deployment attempts sent: 1.

Target:

- App: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default URL reported by CLI: `https://happy-mud-0b375e20f.7.azurestaticapps.net`

Command shape:

```powershell
npx --yes @azure/static-web-apps-cli@2.0.9 deploy app --api-location api --api-language node --api-version 20 --swa-config-location app --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain
```

Deployed package:

- Root: `apps/ice-rink-web/.tmp/v2-8-26-production-swa-package/package_20260626142333`
- App files: 42
- API files: 13
- API health path: `/api/static-contact-health`
- API contact path: `/api/static-contact`
- SWA config: `app/staticwebapp.config.json`

The CLI reported both the front-end app folder and API folder and found the SWA config file.

No retry or second production deployment attempt was sent.
