# Failure Cause Analysis

Generated: 2026-06-04

## Previous Failure

The previous approved storage account creation command shape was:

```powershell
az storage account create --name iceskatingmedia --resource-group rg-ice-production-media --location eastus --sku Standard_LRS --kind StorageV2 --access-tier Hot --https-only true --min-tls-version TLS1_2 --allow-blob-public-access false --public-network-access Enabled --tags site=IceSkatingRinkRentals purpose=production-media managed-by=PumpkinCMS --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name, provisioningState:provisioningState, httpsOnly:supportsHttpsTrafficOnly, minTls:minimumTlsVersion, allowBlobPublicAccess:allowBlobPublicAccess}" -o table
```

The command did not pass a `--subscription` argument. It used the active Azure CLI account context.

Failure:

```text
SubscriptionNotFound
```

Message:

```text
Subscription ff887def-fd83-4a19-9298-13d4b1687873 was not found.
```

## Diagnosis Findings

| Question | Finding |
| --- | --- |
| Is Azure CLI available? | yes, 2.87.0 |
| Is the subscription visible? | yes |
| Is the subscription enabled? | yes |
| Is the subscription default? | yes |
| Does the resource group exist? | yes, `rg-ice-production-media` in `eastus`, Succeeded |
| Is `eastus` visible? | yes |
| Is `Microsoft.Storage` registered? | no, `NotRegistered` |
| Does the storage account name check work? | no, returns `SubscriptionNotFound` |
| Does any storage account exist visibly? | no visible storage accounts |

## Likely Cause

Likely cause:

```text
Microsoft.Storage provider is not registered for the active subscription.
```

The cause is not proven by mutation because provider registration was not approved and was not run. However, the provider state is the strongest read-only indicator.

## Less Likely Causes

Stale or wrong Azure CLI context:

```text
less likely
```

Reason: account list shows one enabled/default subscription and resource group read works.

Wrong tenant:

```text
less likely
```

Reason: the account context and resource group read are consistent.

Unsupported region:

```text
less likely
```

Reason: `eastus` is visible in `az account list-locations`.

Storage account name unavailable:

```text
unresolved
```

Reason: name availability check fails with `SubscriptionNotFound` before returning availability.

Explicit subscription mismatch in command:

```text
not indicated
```

Reason: the failed create command did not pass a separate subscription ID; it used the active context.

## Current State

- Resource group `rg-ice-production-media` remains created.
- Storage account `iceskatingmedia` remains not created.
- Blob container `ice-rink-rentals-media` remains not created.
- Media upload remains blocked.
