# Cleanup Candidate Inventory

Pre-cleanup inventory:

| Resource group | Exists | Location | Resource count | Classification |
| --- | --- | --- | ---: | --- |
| `rg-pumpkin-api-prod-eastus` | yes | East US | 0 | empty cleanup safe candidate |
| `rg-pumpkin-api-prod-eastus2` | yes | East US 2 | 0 | empty cleanup safe candidate |
| `rg-ice-static-form-endpoint` | yes | East US | 3 | non-empty legacy endpoint, defer |

Legacy static form endpoint resources:

| Resource | Type | Location |
| --- | --- | --- |
| `iceforms20260605` | `Microsoft.Storage/storageAccounts` | East US |
| `func-ice-static-contact-20260605` | `Microsoft.Web/sites` | East US |
| `EastUSPlan` | `Microsoft.Web/serverFarms` | East US |
