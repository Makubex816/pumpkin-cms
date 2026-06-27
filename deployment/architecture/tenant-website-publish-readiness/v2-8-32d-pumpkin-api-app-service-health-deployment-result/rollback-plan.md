# Rollback Plan

Current created resource:

- `rg-pumpkin-api-prod-eastus`

Resources not created:

- `asp-pumpkin-api-prod-eastus-001`
- `app-pumpkin-api-prod-eastus-001`

Rollback option if the operator chooses to remove the partial resource group:

```powershell
az group delete --name rg-pumpkin-api-prod-eastus
```

Do not run rollback automatically in this phase. The resource group is empty for the planned App Service resources based on the follow-up plan and Web App `ResourceNotFound` checks, but deletion remains a separate operator decision.

If quota is resolved and the phase is resumed, prefer reusing the existing resource group rather than deleting and recreating it.

