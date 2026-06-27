# Deployment Artifact Plan

This file defines future command shapes for an approved deployment phase. None of these commands were executed in V2.8.32B.

## Source prerequisite

Before deployment, add `GET /api/health` to `apps/pumpkin-api/Program.cs`. The health response should be non-secret and include:

- `ok`
- `service`
- `version`
- `environment`
- `providerConfigured` boolean only
- no connection strings, keys, tokens, or app setting values

## Local build artifact

Future artifact commands:

```powershell
dotnet restore apps/pumpkin-api/pumpkin-api.csproj
dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore
dotnet publish apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore -o .tmp/v2-8-32c/pumpkin-api-publish
Compress-Archive -Path .tmp/v2-8-32c/pumpkin-api-publish/* -DestinationPath .tmp/v2-8-32c/pumpkin-api.zip -Force
```

## Future Azure resource command shape

These are planning artifacts only. They require a separate deployment approval.

```powershell
az group create --name rg-pumpkin-api-prod-eastus --location eastus
az appservice plan create --name asp-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --location eastus --sku S1 --is-linux
az webapp create --name app-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --plan asp-pumpkin-api-prod-eastus-001 --runtime "DOTNETCORE:10.0"
az webapp deploy --resource-group rg-pumpkin-api-prod-eastus --name app-pumpkin-api-prod-eastus-001 --src-path .tmp/v2-8-32c/pumpkin-api.zip --type zip
```

## Protected settings

Protected setting binding must be done in a separate secret-safe step. This package intentionally does not include commands with secret values.

## Rollback artifact

Every deployment execution must keep:

- published zip artifact path
- artifact hash
- deployment timestamp
- App Service resource id
- app setting name manifest without values
- pre-binding static contact/Admin setting name manifest without values
