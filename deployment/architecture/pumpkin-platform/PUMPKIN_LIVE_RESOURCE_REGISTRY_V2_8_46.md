# Pumpkin Live Resource Registry V2.8.46

Status: current after V2.8.46 safe cleanup.

This registry is a public-safe live resource map for Pumpkin/Ice production readiness. It records do-not-delete resources, deleted cleanup candidates, and deferred cleanup candidates. It does not contain secrets.

## Live Do-Not-Delete Resource Groups

| Resource group | Location | Resources | Role |
| --- | --- | ---: | --- |
| `rg-pumpkin-api-prod-centralus` | Central US | 4 | Production Pumpkin API and Admin UI App Services |
| `rg-ice-static-staging` | East US 2 | 2 | Production and isolated Ice Static Web Apps |
| `rg-ice-production-cosmos` | East US | 1 | Production Cosmos DB account |
| `rg-ice-production-media` | East US | 1 | Production media storage |
| `rg-pumpkin-observability-prod-centralus` | Central US | 8 | Log Analytics, action group, metric alerts |

## Live Do-Not-Delete Resources

| Resource | Type | Resource group | Location | Interpretation |
| --- | --- | --- | --- | --- |
| `app-pumpkin-api-prod-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Central US | Production Pumpkin API |
| `asp-pumpkin-api-prod-centralus-001` | App Service plan | `rg-pumpkin-api-prod-centralus` | Central US | Production API/Admin compute plan |
| `app-pumpkin-admin-prod-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Central US | Production Admin UI |
| `app-pumpkin-admin-isolated-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Central US | Isolated Admin UI proof environment |
| `swa-ice-static-staging` | Static Web App | `rg-ice-static-staging` | East US 2 | Production public Ice site |
| `swa-ice-static-isolated-staging` | Static Web App | `rg-ice-static-staging` | East US 2 | Isolated Static Web App proof environment |
| `cosmos-pumpkin-prod-eastus` | Cosmos DB account | `rg-ice-production-cosmos` | East US | Production Pumpkin platform store |
| `iceskatingmedia` | Storage account | `rg-ice-production-media` | East US | Production tenant media storage |
| `law-pumpkin-prod-centralus-001` | Log Analytics workspace | `rg-pumpkin-observability-prod-centralus` | Central US | Production observability workspace |
| `ag-pumpkin-prod-ops-email-001` | Action group | `rg-pumpkin-observability-prod-centralus` | Global | Production operations notification group |
| `alert-pumpkin-api-prod-http5xx-001` | Metric alert | `rg-pumpkin-observability-prod-centralus` | Global | Pumpkin API HTTP 5xx alert |
| `alert-pumpkin-admin-prod-http5xx-001` | Metric alert | `rg-pumpkin-observability-prod-centralus` | Global | Production Admin UI HTTP 5xx alert |
| `alert-pumpkin-admin-isolated-http5xx-001` | Metric alert | `rg-pumpkin-observability-prod-centralus` | Global | Isolated Admin UI HTTP 5xx alert |
| `alert-pumpkin-cosmos-normalized-ru-high-001` | Metric alert | `rg-pumpkin-observability-prod-centralus` | Global | Cosmos normalized RU alert |
| `alert-ice-media-storage-availability-low-001` | Metric alert | `rg-pumpkin-observability-prod-centralus` | Global | Media storage availability alert |
| `alert-ice-swa-prod-function-errors-001` | Metric alert | `rg-pumpkin-observability-prod-centralus` | Global | Production Static Web App function errors alert |

## Deleted Or Absent Cleanup Candidates

| Resource group | V2.8.46 result | Evidence |
| --- | --- | --- |
| `rg-pumpkin-api-prod-eastus` | Deleted | Existed pre-cleanup, resource count 0, lock count 0, absent after delete |
| `rg-pumpkin-api-prod-eastus2` | Deleted | Existed pre-cleanup, resource count 0, lock count 0, absent after delete |

## Deferred Cleanup Candidates

| Resource group | V2.8.46 result | Resources | Reason |
| --- | --- | ---: | --- |
| `rg-ice-static-form-endpoint` | Deferred | 3 | Non-empty legacy static form endpoint stack with current registry/report references |

Deferred resources:

| Resource | Type | Location | Status |
| --- | --- | --- | --- |
| `func-ice-static-contact-20260605` | App Service Function App | East US | Deferred cleanup candidate |
| `EastUSPlan` | App Service plan | East US | Deferred cleanup candidate |
| `iceforms20260605` | Storage account | East US | Deferred cleanup candidate |

## Multi-Tenant Shared-Platform Interpretation

Pumpkin platform resources are shared platform infrastructure, even when currently serving the Ice tenant readiness lane. Do not delete shared platform resources merely because a single tenant phase is complete.

Tenant-specific resources such as the Ice public Static Web Apps and media storage remain production resources while the tenant website is live or undergoing readiness proof.

Fallback resource groups may be deleted only after all of the following are true:

- The group is not in the live do-not-delete registry.
- `az resource list --resource-group <name>` returns zero resources.
- Repo/source/report dependency proof does not show an active dependency.
- No lock blocks deletion.
- Runtime no-regression remains healthy after cleanup.

## Security Boundary

This registry contains no secrets, keys, connection strings, SAS values, appsettings values, or protected config content.
