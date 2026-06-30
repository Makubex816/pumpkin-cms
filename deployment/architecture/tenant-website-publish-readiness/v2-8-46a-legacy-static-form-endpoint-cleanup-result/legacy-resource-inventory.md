# Legacy Resource Inventory

Resource group: `rg-ice-static-form-endpoint`.

| Resource | Type | Location | Result |
| --- | --- | --- | --- |
| `func-ice-static-contact-20260605` | `Microsoft.Web/sites` | East US | Running Function App |
| `EastUSPlan` | `Microsoft.Web/serverFarms` | East US | Dynamic Y1 App Service plan |
| `iceforms20260605` | `Microsoft.Storage/storageAccounts` | East US | StorageV2 backing account |

Function App detail:

- Default hostname: `func-ice-static-contact-20260605.azurewebsites.net`.
- Hostnames: default Azure hostname only.
- Custom hostname count: 0.
- Function count: 1.
- Trigger: anonymous HTTP trigger with `OPTIONS` and `POST` methods on route `static-contact`.

No function keys or host keys were read.
