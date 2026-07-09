# Shared Live Host Resource Map

Shared starter preview host:

- Resource group: `rg-pumpkin-api-prod-centralus`
- App Service plan: `asp-pumpkin-api-prod-centralus-001`
- App Service: `app-pumpkin-starter-preview-centralus-001`
- Default host: `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`
- Runtime: `NODE|22-lts`
- Startup command: `node server.js`

Configured non-secret appsettings by name:

- `NEXT_PUBLIC_PUMPKIN_API_URL`
- `PUMPKIN_API_URL`
- `PUMPKIN_SITE_NAME`
- `NEXT_TELEMETRY_DISABLED`
- `PORT`
- `WEBSITES_PORT`

Not configured:

- `PUMPKIN_TENANT_ID`
- `PUMPKIN_API_KEY`
- Any storage key/listKeys/SAS/connection-string setting
- Any DNS/custom-domain binding
