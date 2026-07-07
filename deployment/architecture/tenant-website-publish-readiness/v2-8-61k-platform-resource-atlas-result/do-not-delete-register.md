# Do-Not-Delete Register

Status: active.

Production do-not-delete:

| resource | type | reason |
| --- | --- | --- |
| app-pumpkin-api-prod-centralus-001 | App Service | live Pumpkin API |
| app-pumpkin-admin-prod-centralus-001 | App Service | live standalone Admin UI |
| asp-pumpkin-api-prod-centralus-001 | App Service plan | compute plan for live App Services |
| swa-ice-static-staging | Static Web App | Ice public website and custom domains |
| cosmos-pumpkin-prod-eastus | Cosmos DB account | production CMS data |
| iceskatingmedia | Storage account | production tenant media |
| app-airstrip-prod-centralus-001 | App Service | Airstrip production default host |
| app-airstrip-preview-isolated-centralus-001 | App Service | Airstrip isolated preview |

Isolated/staging do-not-delete:

| resource | type | reason |
| --- | --- | --- |
| app-pumpkin-admin-isolated-centralus-001 | App Service | isolated Admin UI proof resource |
| swa-ice-static-isolated-staging | Static Web App | isolated Ice/staging proof resource |

Monitoring do-not-delete:

| resource | type | reason |
| --- | --- | --- |
| law-pumpkin-prod-centralus-001 | Log Analytics workspace | production monitoring |
| ag-pumpkin-prod-ops-email-001 | Action group | production ops alerts |
| alert-pumpkin-api-prod-http5xx-001 | Metric alert | API health monitoring |
| alert-pumpkin-admin-prod-http5xx-001 | Metric alert | Admin UI monitoring |
| alert-pumpkin-admin-isolated-http5xx-001 | Metric alert | isolated Admin UI monitoring |
| alert-pumpkin-cosmos-normalized-ru-high-001 | Metric alert | Cosmos monitoring |
| alert-ice-media-storage-availability-low-001 | Metric alert | media storage monitoring |
| alert-ice-swa-prod-function-errors-001 | Metric alert | Ice SWA function monitoring |

Do-not-delete until dependency proof:

| resource | type | reason |
| --- | --- | --- |
| func-ice-static-contact-20260605 | Function App | legacy static contact path needs dependency proof |
| iceforms20260605 | Storage account | legacy static contact support storage |
| EastUSPlan | App Service plan | legacy static contact compute plan |
| rg-pumpkincms-stg-eastus-olm resources | mixed | older staging/outbound-link-manager resources need dependency proof |

No deletion is approved by V2.8.61K.
