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

Blocked.

Approved command attempted:

```text
az storage container set-permission --account-name iceskatingmedia --name ice-rink-rentals-media --public-access blob --auth-mode login
```

Result:

```text
az storage container set-permission: 'login' is not a valid value for '--auth-mode'. Allowed values: key.
```

Because storage keys, connection strings, and SAS URLs were forbidden, no key-auth command was run and no alternative broader Azure mutation was attempted.

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

