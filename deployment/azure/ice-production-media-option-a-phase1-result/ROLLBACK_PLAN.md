# Rollback Plan

## Current Public-Read Changes

Account-level Blob public access was enabled:

```text
storage account: iceskatingmedia
allowBlobPublicAccess: true
```

Container blob-level anonymous read was enabled:

```text
container: ice-rink-rentals-media
publicAccess: Blob
```

## Rollback If Requested

If a future explicit rollback approval is given, revert only the approved Ice media public-read settings:

- set `ice-rink-rentals-media` public access back to `None`
- optionally set `iceskatingmedia` account-level `allowBlobPublicAccess` back to `false`

Do not perform rollback without approval.

## Current Risk

The approved uploaded media blobs are now publicly readable by direct Azure Blob URL. This is expected for Option A and limited to blob-level read, not anonymous container listing.
