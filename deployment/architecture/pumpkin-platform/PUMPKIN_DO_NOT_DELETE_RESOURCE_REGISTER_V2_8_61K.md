# Pumpkin Do-Not-Delete Resource Register V2.8.61K

Status: active.

## Production Core

| resource | type | group | reason |
| --- | --- | --- | --- |
| app-pumpkin-api-prod-centralus-001 | App Service | rg-pumpkin-api-prod-centralus | live Pumpkin API |
| app-pumpkin-admin-prod-centralus-001 | App Service | rg-pumpkin-api-prod-centralus | live standalone Admin UI |
| asp-pumpkin-api-prod-centralus-001 | App Service plan | rg-pumpkin-api-prod-centralus | live compute plan |
| swa-ice-static-staging | Static Web App | rg-ice-static-staging | Ice production public website and custom domains |
| cosmos-pumpkin-prod-eastus | Cosmos DB account | rg-ice-production-cosmos | production CMS data |
| iceskatingmedia | Storage account | rg-ice-production-media | production tenant media |

## Airstrip Frozen Resources

| resource | type | group | reason |
| --- | --- | --- | --- |
| app-airstrip-prod-centralus-001 | App Service | rg-pumpkin-api-prod-centralus | Airstrip production default host |
| app-airstrip-preview-isolated-centralus-001 | App Service | rg-pumpkin-api-prod-centralus | Airstrip isolated preview |
| airstrip-club-las-vegas-media | blob container | iceskatingmedia | Airstrip tenant media |

## Isolated/Proof Resources

| resource | type | group | reason |
| --- | --- | --- | --- |
| app-pumpkin-admin-isolated-centralus-001 | App Service | rg-pumpkin-api-prod-centralus | isolated Admin UI proof |
| swa-ice-static-isolated-staging | Static Web App | rg-ice-static-staging | isolated Ice/SWA proof |

## Monitoring

| resource | type | group | reason |
| --- | --- | --- | --- |
| law-pumpkin-prod-centralus-001 | Log Analytics workspace | rg-pumpkin-observability-prod-centralus | production monitoring |
| ag-pumpkin-prod-ops-email-001 | Action group | rg-pumpkin-observability-prod-centralus | production alert routing |
| alert-pumpkin-api-prod-http5xx-001 | Metric alert | rg-pumpkin-observability-prod-centralus | API monitoring |
| alert-pumpkin-admin-prod-http5xx-001 | Metric alert | rg-pumpkin-observability-prod-centralus | Admin UI monitoring |
| alert-pumpkin-admin-isolated-http5xx-001 | Metric alert | rg-pumpkin-observability-prod-centralus | isolated Admin UI monitoring |
| alert-pumpkin-cosmos-normalized-ru-high-001 | Metric alert | rg-pumpkin-observability-prod-centralus | Cosmos monitoring |
| alert-ice-media-storage-availability-low-001 | Metric alert | rg-pumpkin-observability-prod-centralus | media storage monitoring |
| alert-ice-swa-prod-function-errors-001 | Metric alert | rg-pumpkin-observability-prod-centralus | SWA function monitoring |

## Protected Until Dependency Proof

| resource | type | group | reason |
| --- | --- | --- | --- |
| func-ice-static-contact-20260605 | Function App | rg-ice-static-form-endpoint | legacy endpoint not yet dependency-proved safe to remove |
| iceforms20260605 | Storage account | rg-ice-static-form-endpoint | legacy function storage |
| EastUSPlan | App Service plan | rg-ice-static-form-endpoint | legacy function plan |
| rg-pumpkincms-stg-eastus-olm resources | mixed | rg-pumpkincms-stg-eastus-olm | older staging/outbound-link-manager resources need cleanup proof |

V2.8.61K authorizes no deletion.
