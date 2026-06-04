# Storage Account Discovery

Generated: 2026-06-04

## Read-Only Discovery Command

```powershell
az storage account list --query "[].{name:name, resourceGroup:resourceGroup, location:location}" -o table
```

Review focus:

- Ice media storage candidates by name
- Pumpkin media storage candidates by name
- static web/media hosting storage candidates by name

## Result

Storage accounts discovered:

```text
none visible in the active subscription
```

The command returned no table rows.

## Storage Follow-Up

No storage accounts were visible, so there were no account names, resource groups, or locations to list beyond the approved account-level discovery command.

## Safety Rules Honored

The following were not run:

- `az storage account keys list`
- connection string listing
- SAS generation
- container listing with credentials
- container creation
- blob upload
- access policy modification

## Current Candidate Status

No likely Ice/Pumpkin media storage account was found by name.

No likely static web/media hosting storage account was found by name.
