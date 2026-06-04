# Storage Account Discovery

Generated: 2026-06-04

## Intended Read-Only Discovery

If Azure CLI were available and already logged in, the intended read-only command would be:

```powershell
az storage account list --query '[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name}' -o table
```

Expected review focus:

- Ice media storage candidates
- Pumpkin media storage candidates
- static web/media hosting storage candidates

## Result

Storage accounts discovered:

```text
not discovered
```

Reason:

```text
Azure CLI is unavailable in this terminal.
```

## Safety Rules Honored

The following were not run:

- `az storage account keys list`
- connection string listing
- SAS generation
- container creation
- blob upload
- access policy modification

## Current Candidate Status

No likely Ice/Pumpkin media storage account was confirmed or ruled out.

No likely static web/media hosting storage account was confirmed or ruled out.
