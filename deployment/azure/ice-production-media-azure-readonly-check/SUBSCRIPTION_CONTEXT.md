# Subscription Context

Generated: 2026-06-04

## Read-Only Discovery Commands

```powershell
az account show --query "{name:name, id:id, tenantId:tenantId}" -o table
az account show --query "{name:name, subscriptionId:id, tenantId:tenantId}" -o table
```

The originally requested account query succeeded and confirmed the active account context. The additional aliased query was read-only and was used only to show the subscription ID in table output.

## Result

Subscription context:

```text
valid
```

Current subscription:

```text
Name: Azure subscription 1
Subscription ID: ff887def-fd83-4a19-9298-13d4b1687873
Tenant ID: 38b16667-a82c-4ff8-98d8-aeebbec4536a
```

## Safety Result

- no access tokens printed
- no subscription secrets printed
- no tenant secrets printed
- no credentials read
- no protected config read
- no keys listed
- no connection strings listed
- no SAS URLs generated
