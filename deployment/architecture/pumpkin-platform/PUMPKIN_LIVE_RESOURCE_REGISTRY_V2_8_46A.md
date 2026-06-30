# Pumpkin Live Resource Registry V2.8.46A

Status: current after V2.8.46A legacy endpoint dependency proof.

This registry is public-safe and contains no secrets, keys, connection strings, SAS values, appsetting values, or protected config content.

## Live Do-Not-Touch Resource Groups

| Resource group | Location | Resources | Role |
| --- | --- | ---: | --- |
| `rg-pumpkin-api-prod-centralus` | Central US | 4 | Production Pumpkin API and Admin UI App Services |
| `rg-ice-static-staging` | East US 2 | 2 | Production and isolated Ice Static Web Apps |
| `rg-ice-production-cosmos` | East US | 1 | Production Cosmos DB account |
| `rg-ice-production-media` | East US | 1 | Production media storage |
| `rg-pumpkin-observability-prod-centralus` | Central US | 8 | Log Analytics, action group, metric alerts |

## Live Do-Not-Touch Resources

| Resource | Type | Resource group | Interpretation |
| --- | --- | --- | --- |
| `app-pumpkin-api-prod-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Production Pumpkin API |
| `asp-pumpkin-api-prod-centralus-001` | App Service plan | `rg-pumpkin-api-prod-centralus` | Production API/Admin compute plan |
| `app-pumpkin-admin-prod-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Production Admin UI |
| `app-pumpkin-admin-isolated-centralus-001` | App Service Web App | `rg-pumpkin-api-prod-centralus` | Isolated Admin UI proof environment |
| `swa-ice-static-staging` | Static Web App | `rg-ice-static-staging` | Production public Ice site |
| `swa-ice-static-isolated-staging` | Static Web App | `rg-ice-static-staging` | Isolated Static Web App proof environment |
| `cosmos-pumpkin-prod-eastus` | Cosmos DB account | `rg-ice-production-cosmos` | Production Pumpkin platform store |
| `iceskatingmedia` | Storage account | `rg-ice-production-media` | Production tenant media storage |
| `law-pumpkin-prod-centralus-001` | Log Analytics workspace | `rg-pumpkin-observability-prod-centralus` | Production observability workspace |
| `ag-pumpkin-prod-ops-email-001` | Action group | `rg-pumpkin-observability-prod-centralus` | Production operations notification group |

## Deleted Or Absent Cleanup Candidates

| Resource group | Status | Source |
| --- | --- | --- |
| `rg-pumpkin-api-prod-eastus` | Deleted in V2.8.46 | Empty fallback group |
| `rg-pumpkin-api-prod-eastus2` | Deleted in V2.8.46 | Empty fallback group |

## Deferred Legacy Endpoint

| Resource group | Status | Reason |
| --- | --- | --- |
| `rg-ice-static-form-endpoint` | Deferred in V2.8.46A | Recent Function App traffic/executions and unclassified storage contents |

Deferred resources:

| Resource | Type | Evidence |
| --- | --- | --- |
| `func-ice-static-contact-20260605` | Function App | Running; anonymous HTTP POST trigger at `static-contact`; recent requests/executions observed |
| `EastUSPlan` | App Service plan | Dynamic Y1 plan serving the legacy Function App |
| `iceforms20260605` | Storage account | Function backing storage; containers visible, blob contents not classifiable with approved RBAC-only read |

V2.8.46A did not stop or delete the legacy endpoint.

## Multi-Tenant Shared-Platform Interpretation

Pumpkin platform resources remain shared production infrastructure even when a specific tenant readiness phase is complete. Do not delete shared platform resources without current dependency proof.

Legacy tenant endpoint resources can be decommissioned only after all of the following are true:

- No recent Function App requests or executions appear in Azure metrics.
- Storage data is classified as disposable runtime artifact data or preserved by an approved backup/export.
- Live SWA/App Service appsetting scans show no legacy endpoint dependency.
- Repo/source/deployment scripts show no active dependency.
- Pre-stop and post-stop GET-only runtime no-regression checks stay green.
- A later approval explicitly authorizes stop/delete after the remaining proof is satisfied.
