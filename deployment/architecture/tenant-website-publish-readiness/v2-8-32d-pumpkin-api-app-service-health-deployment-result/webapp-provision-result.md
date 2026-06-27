# Web App Provision Result

Web App: `app-pumpkin-api-prod-eastus-001`

Resource group: `rg-pumpkin-api-prod-eastus`

Planned runtime: `DOTNETCORE|10.0`

Result: not created.

Reason: App Service plan creation was blocked by Azure quota before the Web App create step.

Follow-up state check:

```powershell
az webapp show --name app-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --output json
```

Result: `ResourceNotFound`.

No Web App creation command was sent after the App Service plan blocker.

