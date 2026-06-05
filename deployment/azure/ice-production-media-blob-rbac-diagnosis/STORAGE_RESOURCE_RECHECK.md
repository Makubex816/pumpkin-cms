# Storage Resource Recheck

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

## Storage Account Check

Command:

```powershell
az storage account show --name iceskatingmedia --resource-group rg-ice-production-media --query "{name:name, resourceGroup:resourceGroup, location:location, provisioningState:provisioningState, kind:kind, sku:sku.name, accessTier:accessTier, httpsOnly:enableHttpsTrafficOnly, minimumTlsVersion:minimumTlsVersion, allowBlobPublicAccess:allowBlobPublicAccess}" -o table
```

Result:

```text
Name: iceskatingmedia
Resource group: rg-ice-production-media
Location: eastus
Provisioning state: Succeeded
Kind: StorageV2
SKU: Standard_LRS
Access tier: Hot
HTTPS-only: True
Minimum TLS: TLS1_2
Allow Blob public access: False
```

## Blob Container Management-Plane Check

Command:

```powershell
az storage container-rm show --storage-account iceskatingmedia --resource-group rg-ice-production-media --name ice-rink-rentals-media --query "{name:name, publicAccess:publicAccess}" -o table
```

Result:

```text
Name: ice-rink-rentals-media
Public access: None
```

## Safety Result

No resources were created, deleted, or modified.

No storage keys, connection strings, or SAS URLs were printed.
