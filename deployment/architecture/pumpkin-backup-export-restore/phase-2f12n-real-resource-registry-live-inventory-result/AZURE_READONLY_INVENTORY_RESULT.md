# Azure Read-Only Inventory Result

Azure CLI was available and already logged in.

Read-only commands used only projected non-secret fields:

- `az account show`
- `az group list`
- `az resource list`
- `az cosmosdb show`
- `az cosmosdb sql database list`
- `az cosmosdb sql container list`
- `az storage account show`
- `az storage container list --auth-mode login`
- `az staticwebapp show`
- `az functionapp show`

Forbidden commands not used:

- `az cosmosdb keys list`
- `az storage account keys list`
- `az storage account show-connection-string`
- `az storage blob generate-sas`
- `az functionapp config appsettings list`
- `az staticwebapp secrets list`

Inventoried non-secret Azure resources:

| Resource | Type | Resource group | Status |
| --- | --- | --- | --- |
| `Azure subscription 1` | subscription | n/a | Enabled |
| `rg-ice-production-media` | resource group | n/a | Succeeded |
| `rg-ice-static-form-endpoint` | resource group | n/a | Succeeded |
| `rg-ice-production-cosmos` | resource group | n/a | Succeeded |
| `rg-ice-static-staging` | resource group | n/a | Succeeded |
| `iceskatingmedia` | storage account | `rg-ice-production-media` | available |
| `ice-rink-rentals-media` | storage container | `iceskatingmedia` | name-only metadata |
| `cosmos-pumpkin-prod-eastus` | Cosmos account | `rg-ice-production-cosmos` | Succeeded |
| `pumpkin-prod-cms` | Cosmos SQL database | `rg-ice-production-cosmos` | verified |
| `forms`, `importRuns`, `routes`, `mediaAssets`, `users`, `themes`, `pages`, `sites`, `tenants`, `publishRuns` | Cosmos containers | `rg-ice-production-cosmos` | verified |
| `swa-ice-static-staging` | Static Web App | `rg-ice-static-staging` | verified |
| `func-ice-static-contact-20260605` | Function App | `rg-ice-static-form-endpoint` | Running |
| `EastUSPlan` | App Service plan | `rg-ice-static-form-endpoint` | verified |
| `iceforms20260605` | function storage account | `rg-ice-static-form-endpoint` | available |

Function storage container names were inventoried as names only. No app setting values, storage keys, connection strings, blob contents, or SAS values were read.
