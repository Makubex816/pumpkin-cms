# Access Change Result

## Account-Level Blob Public Access

Completed for the approved storage account only:

```text
storage account: iceskatingmedia
resource group: rg-ice-production-media
allowBlobPublicAccess: True
```

Unchanged in the readback:

```text
enableHttpsTrafficOnly: True
minimumTlsVersion: TLS1_2
```

## Container Blob-Level Anonymous Read

Completed in Phase 1B.

The Phase 1 `az storage container set-permission --auth-mode login` path was blocked because that command required key auth in this environment. Phase 1B used the approved no-key Azure Resource Manager management-plane method instead.

Approved ARM target:

```text
/subscriptions/{subscriptionId}/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media
```

Result:

```text
properties.publicAccess: Blob
```

Storage data-plane keys, connection strings, and SAS URLs were not used or printed.

## Scope Confirmation

This run did not:

- change Azure networking
- change storage SKU or redundancy
- change TLS settings
- create containers
- upload blobs
- delete blobs
- print storage keys
- print connection strings
- generate SAS URLs
- change Cloudflare or DNS
