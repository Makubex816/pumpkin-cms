# Resource Group Provision Result

Resource group: `rg-pumpkin-api-prod-eastus`

Region: `eastus`

Command sequence:

```powershell
az group show --name rg-pumpkin-api-prod-eastus --output json
az group create --name rg-pumpkin-api-prod-eastus --location eastus --output json
```

Result: created.

Provisioning evidence:

| Field | Value |
| --- | --- |
| Name | `rg-pumpkin-api-prod-eastus` |
| Location | `eastus` |
| Type | `Microsoft.Resources/resourceGroups` |
| Provisioning state | `Succeeded` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |

The resource group now exists.

