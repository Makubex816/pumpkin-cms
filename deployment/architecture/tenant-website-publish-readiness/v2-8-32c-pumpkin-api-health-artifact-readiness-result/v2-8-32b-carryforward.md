# V2.8.32B Carryforward

V2.8.32B concluded that no verified live Pumpkin API Web App/App Service existed in active Azure metadata and selected a new Linux Azure App Service target for Pumpkin API.

## Planned Target

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| App Service plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App | `app-pumpkin-api-prod-eastus-001` |
| Region | `eastus` |
| Runtime | `.NET 10 / ASP.NET Core` |
| Initial API URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |

## Source Prerequisites From V2.8.32B

- Add `GET /api/health` before deployment.
- Keep `/` only as a launch/welcome probe.
- Prove `POST /api/forms/ice-rink-rentals/entries` shape.
- Prove `GET /api/admin/ice-rink-rentals/form-entries` shape.
- Produce a local publish artifact under ignored output.
- Defer Azure creation, app settings, protected value binding, deploy, and contact writes to separate approvals.

## V2.8.32C Resolution

V2.8.32C added the health routes, verified both FormEntry route shapes, built/tested locally, published locally, and prepared the future V2.8.32D App Service provisioning/deployment prompt without executing it.
