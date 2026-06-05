# Region Check

Generated: 2026-06-04

## Approved Region

```text
eastus
```

## Command Run

```powershell
az account list-locations --query "[?name=='eastus'].{name:name, displayName:displayName, regionalDisplayName:regionalDisplayName}" -o table
```

## Result

```text
Name: eastus
Display name: East US
Regional display name: (US) East US
```

## Interpretation

`eastus` is visible in the active subscription location list.

An unsupported region is unlikely to be the cause of the storage account creation failure.

## Safety Result

No resources were created, modified, or deleted.
