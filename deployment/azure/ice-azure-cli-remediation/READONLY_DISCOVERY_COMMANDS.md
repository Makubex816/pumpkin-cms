# Read-Only Discovery Commands

Generated: 2026-06-04

## Scope

Future commands only. These commands were not run in this remediation pass.

## Allowed Future Read-Only Commands

Check Azure CLI version:

```powershell
az version
```

Check active subscription context:

```powershell
az account show --query "{name:name,id:id}" -o json
```

List resource groups by name and region:

```powershell
az group list --query "[].{name:name,location:location}" -o table
```

List storage accounts by name, resource group, and region:

```powershell
az storage account list --query "[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name}" -o table
```

List Static Web Apps if supported in the current CLI environment:

```powershell
az staticwebapp list --query "[].{name:name,resourceGroup:resourceGroup,location:location,defaultHostname:defaultHostname}" -o table
```

## Review Focus

Future read-only discovery should look for candidate resources by name only:

- Ice media storage candidates
- Pumpkin media storage candidates
- static web or media hosting candidates
- relevant resource groups
- Static Web App candidates

## Explicitly Forbidden Commands

Do not run:

- `az group create`
- `az storage account create`
- `az storage container create`
- `az storage account keys list`
- `az storage blob upload`
- `az deployment group create`
- DNS or Cloudflare mutation commands
- CMS write commands
- MediaAsset write commands

## Secret Safety

Do not print:

- access tokens
- storage keys
- connection strings
- SAS URLs
- deployment tokens
- provider credentials

## Current Run Result

No Azure discovery commands were run.
