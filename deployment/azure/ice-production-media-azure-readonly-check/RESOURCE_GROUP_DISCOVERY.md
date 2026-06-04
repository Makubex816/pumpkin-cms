# Resource Group Discovery

Generated: 2026-06-04

## Read-Only Discovery Command

```powershell
az group list --query "[].{name:name, location:location}" -o table
```

Review focus:

- Ice media resource group candidates by name
- Pumpkin media resource group candidates by name
- static web or media hosting resource group candidates by name

## Result

Resource groups discovered:

```text
none visible in the active subscription
```

The command returned no table rows.

## Current Candidate Status

No likely Ice/Pumpkin media resource groups were found by name.

No likely Static Web App resource groups were found by name.

## Safety Result

No resource groups were created, modified, or deleted.
