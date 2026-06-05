# Azure Account Context

Generated: 2026-06-04

## Commands Run

```powershell
az --version
az account show --query "{name:name, id:id, tenantId:tenantId, state:state, isDefault:isDefault}" -o table
az account list --query "[].{name:name, id:id, tenantId:tenantId, state:state, isDefault:isDefault}" -o table
az account show --query "{name:name, subscriptionId:id, tenantId:tenantId, state:state, isDefault:isDefault}" -o table
az account list --query "[].{name:name, subscriptionId:id, tenantId:tenantId, state:state, isDefault:isDefault}" -o table
```

The aliased `subscriptionId` queries were read-only and were used because Azure CLI table output omitted the field named `id`.

## Azure CLI Result

```text
Azure CLI: 2.87.0
```

## Active Subscription

```text
Name: Azure subscription 1
Subscription ID: ff887def-fd83-4a19-9298-13d4b1687873
Tenant ID: 38b16667-a82c-4ff8-98d8-aeebbec4536a
State: Enabled
Default: True
```

## Visible Subscription List

Only one subscription was visible in the account list:

```text
Name: Azure subscription 1
Subscription ID: ff887def-fd83-4a19-9298-13d4b1687873
Tenant ID: 38b16667-a82c-4ff8-98d8-aeebbec4536a
State: Enabled
Default: True
```

## Interpretation

The Azure CLI context appears valid for read-only subscription and resource group operations.

The subscription is visible, enabled, and default. This makes a stale local subscription selection less likely than a storage provider registration or Storage resource provider path issue.

## Safety Result

No access tokens, storage keys, connection strings, SAS URLs, credentials, or protected config values were printed or read.
