# Existing Resource Candidates

Generated: 2026-06-04

## Result

No Azure resource candidates could be listed because Azure CLI is unavailable in this terminal.

## Candidate Categories Not Yet Discovered

- Ice production media storage account
- Pumpkin media storage account
- static web/media hosting storage account
- Ice/Pumpkin media resource group
- Azure Static Web App resource group
- Azure Static Web App instance

## Future Read-Only Candidate Commands

Run only after Azure CLI is available and already logged in:

```powershell
az group list --query '[].{name:name,location:location}' -o table
az storage account list --query '[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name}' -o table
az staticwebapp list --query '[].{name:name,resourceGroup:resourceGroup,location:location,defaultHostname:defaultHostname}' -o table
```

Do not run commands that create, modify, upload, deploy, list keys, print connection strings, or generate SAS URLs.

## Current Status

Existing resource candidates:

```text
unknown due Azure CLI availability blocker
```
