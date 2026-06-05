# Storage Account Result

Generated: 2026-06-04

## Approved Storage Account

```text
iceskatingmedia
```

Approved resource group:

```text
rg-ice-production-media
```

Approved region:

```text
eastus
```

## Pre-Create Checks

Read-only exact storage account check:

```powershell
az storage account show --name iceskatingmedia --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name}" -o table
```

Pre-create result:

```text
Storage account 'iceskatingmedia' not found.
```

Visible storage account list before creation returned no rows.

Optional name availability check:

```powershell
az storage account check-name --name iceskatingmedia --query "{nameAvailable:nameAvailable, reason:reason, message:message}" -o table
```

Optional check result:

```text
SubscriptionNotFound
```

The optional name availability check did not prove the name unavailable. The approved create command was used as the authoritative stop point for the exact approved storage account name.

## Create Command Run

Approved command run:

```powershell
az storage account create --name iceskatingmedia --resource-group rg-ice-production-media --location eastus --sku Standard_LRS --kind StorageV2 --access-tier Hot --https-only true --min-tls-version TLS1_2 --allow-blob-public-access false --public-network-access Enabled --tags site=IceSkatingRinkRentals purpose=production-media managed-by=PumpkinCMS --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name, provisioningState:provisioningState, httpsOnly:supportsHttpsTrafficOnly, minTls:minimumTlsVersion, allowBlobPublicAccess:allowBlobPublicAccess}" -o table
```

Create result:

```text
FAILED
```

Azure error code:

```text
SubscriptionNotFound
```

Azure error message:

```text
Subscription ff887def-fd83-4a19-9298-13d4b1687873 was not found.
```

## Post-Create Verification

Read-only exact storage account verification:

```powershell
az storage account show --name iceskatingmedia --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, kind:kind, sku:sku.name, provisioningState:provisioningState}" -o table
```

Verification result:

```text
Storage account 'iceskatingmedia' not found.
```

Visible storage account list after the failed create returned no rows.

## Stop Decision

Resource creation stopped after this failure.

No alternate storage account name was created. No provider registration, subscription mutation, deployment command, key listing, connection string listing, SAS generation, or media upload was attempted.
