# Azure Resource Registry Current

## Production / Active

| Resource | Type | Resource group | Region | Classification |
| --- | --- | --- | --- | --- |
| `swa-ice-static-staging` | Static Web App | `rg-ice-static-staging` | East US 2 | Production public Ice site |
| `swa-ice-static-isolated-staging` | Static Web App | `rg-ice-static-staging` | East US 2 | Isolated proof environment |
| `app-pumpkin-api-prod-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Central US | Production Pumpkin API |
| `asp-pumpkin-api-prod-centralus-001` | App Service Plan | `rg-pumpkin-api-prod-centralus` | Central US | Production API compute plan |
| `cosmos-pumpkin-prod-eastus` | Cosmos DB account | `rg-ice-production-cosmos` | East US | Production Pumpkin store |
| `iceskatingmedia` | Storage account | `rg-ice-production-media` | East US | Production media storage |

## Legacy / Fallback / Review

| Resource | Type | Resource group | Region | Classification |
| --- | --- | --- | --- | --- |
| `func-ice-static-contact-20260605` | Function App | `rg-ice-static-form-endpoint` | East US | Legacy/static-form stack, cleanup-review |
| `EastUSPlan` | App Service Plan | `rg-ice-static-form-endpoint` | East US | Function App plan, cleanup-review |
| `iceforms20260605` | Storage account | `rg-ice-static-form-endpoint` | East US | Function backing storage, cleanup-review |
| `rg-pumpkin-api-prod-eastus` | Resource group | same | East US | Empty fallback group |
| `rg-pumpkin-api-prod-eastus2` | Resource group | same | East US 2 | Empty fallback group |

## Nonproduction / Shared

| Resource group | Contents | Classification |
| --- | --- | --- |
| `rg-pumpkincms-stg-eastus-olm` | OLM staging Cosmos, storage, managed identity, Key Vault, App Insights, Log Analytics, action group | Active nonproduction, do not delete |
| `DefaultResourceGroup-EUS` | Default Log Analytics workspace | Shared/unknown, do not delete without owner confirmation |
