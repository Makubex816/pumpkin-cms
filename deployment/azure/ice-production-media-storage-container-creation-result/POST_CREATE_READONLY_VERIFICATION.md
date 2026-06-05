# Post-Create Read-Only Verification

Generated: 2026-06-04

## Storage Account Verification

Command:

```powershell
az storage account show --name iceskatingmedia --resource-group rg-ice-production-media --query "{name:name, resourceGroup:resourceGroup, location:primaryLocation, provisioningState:provisioningState, kind:kind, sku:sku.name, minimumTlsVersion:minimumTlsVersion, allowBlobPublicAccess:allowBlobPublicAccess, accessTier:accessTier}" -o table
```

Result:

```text
Name: iceskatingmedia
Resource group: rg-ice-production-media
Location: eastus
Provisioning state: Succeeded
Kind: StorageV2
SKU: Standard_LRS
Minimum TLS: TLS1_2
Allow Blob public access: False
Access tier: Hot
```

HTTPS-only verification:

```text
Enable HTTPS traffic only: True
```

Storage account list after creation returned:

```text
Name: iceskatingmedia
Resource group: rg-ice-production-media
Location: eastus
```

## Blob Container Verification

Container existence:

```text
ice-rink-rentals-media exists: True
```

Container public access:

```text
None
```

## Upload Verification

No `az storage blob upload` or `az storage blob upload-batch` command was run.

A read-only blob-list count check was blocked by data-plane RBAC permissions. The run did not switch to key auth or print credentials.

## Safety Verification

- no storage account keys listed
- no connection strings printed
- no SAS URLs generated
- no media uploaded
- no Cloudflare/DNS changes made
- no CMS writes made
- no MediaAsset writes made
- no static deployment run
- no protected config read
- no email/Microsoft 365 work performed
- Roller remained untouched
