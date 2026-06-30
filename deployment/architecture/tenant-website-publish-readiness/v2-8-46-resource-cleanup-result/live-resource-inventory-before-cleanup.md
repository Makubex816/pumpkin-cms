# Live Resource Inventory Before Cleanup

Do-not-delete resource groups:

| Resource group | Location | Resource count | Resources |
| --- | --- | ---: | --- |
| `rg-pumpkin-api-prod-centralus` | Central US | 4 | `asp-pumpkin-api-prod-centralus-001`, `app-pumpkin-api-prod-centralus-001`, `app-pumpkin-admin-isolated-centralus-001`, `app-pumpkin-admin-prod-centralus-001` |
| `rg-ice-static-staging` | East US 2 | 2 | `swa-ice-static-staging`, `swa-ice-static-isolated-staging` |
| `rg-ice-production-cosmos` | East US | 1 | `cosmos-pumpkin-prod-eastus` |
| `rg-ice-production-media` | East US | 1 | `iceskatingmedia` |
| `rg-pumpkin-observability-prod-centralus` | Central US | 8 | `law-pumpkin-prod-centralus-001`, `ag-pumpkin-prod-ops-email-001`, six metric alerts |

No live resource group was in the approved deletion scope.
