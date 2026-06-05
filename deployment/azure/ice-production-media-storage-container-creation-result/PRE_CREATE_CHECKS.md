# Pre-Create Checks

Generated: 2026-06-04

## Resource Group Check

Command:

```powershell
az group show --name rg-ice-production-media --query "{name:name, location:location, provisioningState:properties.provisioningState}" -o table
```

Result:

```text
Name: rg-ice-production-media
Location: eastus
Provisioning state: Succeeded
```

## Storage Account Name Check

Command:

```powershell
az storage account check-name --name iceskatingmedia --query "{nameAvailable:nameAvailable, reason:reason, message:message}" -o table
```

Result:

```text
NameAvailable: True
```

The first attempt printed `NameAvailable: True` but hit the command timeout wrapper while finishing. The command was rerun with a longer timeout and exited successfully with `NameAvailable: True`.

## Existing Storage Accounts Before Creation

Command:

```powershell
az storage account list --query "[].{name:name, resourceGroup:resourceGroup, location:location}" -o table
```

Result:

```text
No visible storage accounts were returned before creation.
```

## Stop Conditions Checked

- `Microsoft.Storage` was `Registered`
- resource group existed and was `Succeeded`
- storage account name was available
- no visible existing storage account conflicted with `iceskatingmedia`

## Safety Result

No keys, connection strings, SAS URLs, or protected config values were read or printed.
