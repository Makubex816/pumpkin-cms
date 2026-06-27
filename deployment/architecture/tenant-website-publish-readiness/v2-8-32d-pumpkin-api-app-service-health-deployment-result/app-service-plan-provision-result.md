# App Service Plan Provision Result

Plan: `asp-pumpkin-api-prod-eastus-001`

Resource group: `rg-pumpkin-api-prod-eastus`

Region: `eastus`

SKU requested from V2.8.32C carryforward command plan: `S1`

Linux plan flag: `--is-linux`

Command sequence:

```powershell
az appservice plan show --name asp-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --output json
az appservice plan create --name asp-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --location eastus --sku S1 --is-linux --output json
```

Result: blocked by Azure quota. The plan was not created.

Azure returned:

```text
Operation cannot be completed without additional quota.
Location: East US
Current Limit (Total VMs): 0
Current Usage: 0
Amount required for this deployment (Total VMs): 1
(Minimum) New Limit that you should request to enable this deployment: 1.
```

Follow-up state check:

```powershell
az appservice plan show --name asp-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --output json
```

Result: `ResourceNotFound`.

No alternate region, alternate SKU, quota request, or non-approved resource was attempted.

