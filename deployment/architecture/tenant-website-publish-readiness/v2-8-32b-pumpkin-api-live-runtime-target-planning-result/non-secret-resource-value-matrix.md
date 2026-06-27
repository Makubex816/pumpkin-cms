# Non-Secret Resource Value Matrix

## Current resources

| Value | Resource |
| --- | --- |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Production SWA | `swa-ice-static-staging` |
| Production SWA resource group | `rg-ice-static-staging` |
| Production SWA default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Production custom domains | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` |
| Isolated SWA | `swa-ice-static-isolated-staging` |
| Isolated SWA default hostname | `kind-island-0a85a740f.7.azurestaticapps.net` |
| Static contact Function App | `func-ice-static-contact-20260605` |
| Static contact Function App resource group | `rg-ice-static-form-endpoint` |
| Existing App Service plan | `EastUSPlan`, Y1 Function plan only |
| Production Cosmos account | `cosmos-pumpkin-prod-eastus` |
| Production Cosmos resource group | `rg-ice-production-cosmos` |
| Production Cosmos database | `pumpkin-prod-cms` |
| Production FormEntry container | `forms` |

## Planned new API resources

| Value | Plan |
| --- | --- |
| API resource group | `rg-pumpkin-api-prod-eastus` |
| API App Service plan | `asp-pumpkin-api-prod-eastus-001` |
| API Web App | `app-pumpkin-api-prod-eastus-001` |
| API region | `eastus` |
| API SKU | `S1` |
| API runtime | .NET 10 / ASP.NET Core on Linux |
| API base URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |
| API health endpoint | `GET /api/health` after source prerequisite |
| API contact write endpoint | `POST /api/forms/ice-rink-rentals/entries` |
| API Admin form list endpoint | `GET /api/admin/ice-rink-rentals/form-entries` |

## Not selected

| Resource class | Reason |
| --- | --- |
| Existing candidate publish-profile host | Not visible in current Web App metadata |
| Container Apps | Provider not registered and no container packaging surface |
| Function App | Existing Function App is the static contact endpoint, not the ASP.NET Core API |
