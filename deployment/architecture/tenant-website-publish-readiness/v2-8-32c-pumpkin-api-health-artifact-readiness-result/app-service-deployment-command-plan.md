# App Service Deployment Command Plan

This is a future command plan only. None of these commands were executed in V2.8.32C.

## Future Runtime Check

Before creating resources, V2.8.32D must verify that the target runtime is supported for Linux App Service in the active subscription and region. If `.NET 10 / ASP.NET Core` is not available as an App Service runtime, stop and request an explicit runtime decision.

## Future Resource Creation Commands

```powershell
az group create --name rg-pumpkin-api-prod-eastus --location eastus
az appservice plan create --name asp-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --location eastus --sku S1 --is-linux
az webapp create --name app-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --plan asp-pumpkin-api-prod-eastus-001 --runtime "DOTNETCORE:10.0"
```

## Future Deploy Command

```powershell
az webapp deploy --resource-group rg-pumpkin-api-prod-eastus --name app-pumpkin-api-prod-eastus-001 --src-path .tmp/v2-8-32c/pumpkin-api.zip --type zip
```

## Hard Stops

- Do not execute these commands without V2.8.32D approval.
- Do not print, list, or export deployment tokens.
- Do not use publish profiles in Codex output.
- Do not run contact POSTs in the deployment phase.
