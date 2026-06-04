# Resource Group Discovery

Generated: 2026-06-04

## Intended Read-Only Discovery

If Azure CLI were available and already logged in, the intended read-only command would be:

```powershell
az group list --query '[].{name:name,location:location}' -o table
```

Expected review focus:

- Ice media resource group candidates by name
- Pumpkin media resource group candidates by name
- static web or media hosting resource group candidates by name

## Result

Resource groups discovered:

```text
not discovered
```

Reason:

```text
Azure CLI is unavailable in this terminal.
```

## Current Candidate Status

No likely Ice/Pumpkin media resource groups were confirmed or ruled out.

No likely Static Web App resource groups were confirmed or ruled out.

## Safety Result

No resource groups were created or modified.
