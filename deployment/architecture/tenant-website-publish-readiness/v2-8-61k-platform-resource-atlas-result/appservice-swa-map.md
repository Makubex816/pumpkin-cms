# App Service And Static Web App Map

App Services:

| name | resourceGroup | region | state | defaultHost | boundTenantOrSystem | doNotDeleteStatus |
| --- | --- | --- | --- | --- | --- | --- |
| app-pumpkin-api-prod-centralus-001 | rg-pumpkin-api-prod-centralus | Central US | Running | app-pumpkin-api-prod-centralus-001.azurewebsites.net | Pumpkin API production | do_not_delete |
| app-pumpkin-admin-prod-centralus-001 | rg-pumpkin-api-prod-centralus | Central US | Running | app-pumpkin-admin-prod-centralus-001.azurewebsites.net | standalone Admin UI production | do_not_delete |
| app-pumpkin-admin-isolated-centralus-001 | rg-pumpkin-api-prod-centralus | Central US | Running | app-pumpkin-admin-isolated-centralus-001.azurewebsites.net | Admin UI isolated proof | do_not_delete |
| app-airstrip-prod-centralus-001 | rg-pumpkin-api-prod-centralus | Central US | Running | app-airstrip-prod-centralus-001.azurewebsites.net | Airstrip production default host | do_not_delete_airstrip_frozen |
| app-airstrip-preview-isolated-centralus-001 | rg-pumpkin-api-prod-centralus | Central US | Running | app-airstrip-preview-isolated-centralus-001.azurewebsites.net | Airstrip isolated preview | do_not_delete_airstrip_frozen |
| func-ice-static-contact-20260605 | rg-ice-static-form-endpoint | East US | not_checked | func-ice-static-contact-20260605.azurewebsites.net | legacy static contact Function App | do_not_delete_until_dependency_proof |

App Service plans:

| name | resourceGroup | region | sku | sites | purpose | doNotDeleteStatus |
| --- | --- | --- | --- | ---: | --- | --- |
| asp-pumpkin-api-prod-centralus-001 | rg-pumpkin-api-prod-centralus | Central US | Basic B1 | 5 | shared Linux App Service plan | do_not_delete |
| EastUSPlan | rg-ice-static-form-endpoint | East US | Dynamic Y1 | 1 | legacy static contact Function plan | do_not_delete_until_dependency_proof |

Static Web Apps:

| name | resourceGroup | region | sku | defaultHost | customDomains | boundTenantOrSystem | doNotDeleteStatus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| swa-ice-static-staging | rg-ice-static-staging | East US 2 | Free | happy-mud-0b375e20f.7.azurestaticapps.net | iceskatingrinkrentals.com; www.iceskatingrinkrentals.com | Ice production public website | do_not_delete |
| swa-ice-static-isolated-staging | rg-ice-static-staging | East US 2 | Free | kind-island-0a85a740f.7.azurestaticapps.net | none | Ice isolated/staging proof | do_not_delete |

Hostname state:

- Ice apex and www custom domains are Ready on `swa-ice-static-staging`.
- Isolated SWA has no custom domains.
- App Services currently show default Azure hostnames only in read-only hostname metadata.
