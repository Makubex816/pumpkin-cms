# Azure CLI Status

Generated: 2026-06-04

## Commands Run

Read-only availability/version check:

```powershell
az --version
```

Read-only account checks:

```powershell
az account show --query "{name:name, id:id, tenantId:tenantId}" -o table
az account show --query "{name:name, subscriptionId:id, tenantId:tenantId}" -o table
```

The second account query aliases `id` as `subscriptionId` because the requested table formatter omitted the field named `id`.

## Result

Azure CLI availability:

```text
AVAILABLE
```

Azure CLI version:

```text
2.87.0
```

Azure login/account status:

```text
VALID
```

Current subscription:

```text
Name: Azure subscription 1
Subscription ID: ff887def-fd83-4a19-9298-13d4b1687873
Tenant ID: 38b16667-a82c-4ff8-98d8-aeebbec4536a
```

## Blocker Status

The previous Azure CLI availability blocker is cleared in this terminal.

## Safety Result

No access tokens, keys, connection strings, SAS URLs, credentials, or protected config values were printed or read.
