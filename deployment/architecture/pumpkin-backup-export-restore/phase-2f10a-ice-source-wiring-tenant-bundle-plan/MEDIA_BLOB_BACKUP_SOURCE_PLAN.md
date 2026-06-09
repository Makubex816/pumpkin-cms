# Media Blob Backup Source Plan

## Current Finding

Phase 2F-10 included CMS MediaAsset metadata but no blob copies. Phase 2F-10A read-only Azure discovery found:

- storage account `iceskatingmedia`;
- resource group `rg-ice-production-media`;
- container `ice-rink-rentals-media`;
- container public access `blob`;
- no blob contents listed or downloaded.

Safe docs define the production media URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Source Definition

Live media blob source:

- account: `iceskatingmedia`;
- container: `ice-rink-rentals-media`;
- public host: `media.iceskatingrinkrentals.com`;
- CMS metadata source: MediaAsset records from Pumpkin API/admin;
- blob path source: MediaAsset `blobPath` and production URL contract.

## Connector Strategy

Implement media connectors in this order:

1. `media-source-discovery`: confirms account/container/public host with read-only Azure identity.
2. `media-asset-to-blob-map`: joins CMS MediaAsset metadata to expected blob paths.
3. `blob-inventory-readonly`: lists blob names, size, content type, etag/last-modified/checksum metadata when allowed.
4. `blob-copy-local`: copies selected blobs to ignored `.tmp` output when separately approved.
5. `blob-copy-private-storage`: copies to private backup storage when separately approved.
6. `media-restore-verifier`: compares copied blobs against MediaAsset metadata and page references.

## Required Future Env/Tooling

Presence-only candidate names:

- `ICE_MEDIA_STORAGE_ACCOUNT`
- `ICE_MEDIA_CONTAINER`
- `ICE_MEDIA_PUBLIC_HOST`
- `ICE_MEDIA_BACKUP_OUTPUT_DIR`
- `ICE_MEDIA_COPY_MODE`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_BACKUP_STORAGE_ACCOUNT`
- `AZURE_BACKUP_CONTAINER`

Optional only if identity-based access is unavailable and owner explicitly approves:

- `ICE_MEDIA_READ_ONLY_SAS`

SAS values must never be printed or written.

## Production Restore Proof Rule

Media binary proof remains blocked until blob inventory/copy evidence covers the selected MediaAsset scope and validator checks copied blob count, checksums, content types, and path safety.

