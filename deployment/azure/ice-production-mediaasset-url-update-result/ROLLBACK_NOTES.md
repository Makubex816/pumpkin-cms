# Rollback Notes

Date: 2026-06-05

## Scope

Rollback, if ever approved, should affect only the 9 MediaAsset records changed in this run.

No rollback was performed in this run.

## Previous URL Shape

Before this update, each approved MediaAsset used:

```text
/media/ice-rink-rentals/2026/06/{safeFileName}
```

The previous storage metadata used:

```text
storageProvider: local-dev
storageContainer: media-assets
blobPath: ice-rink-rentals/2026/06/{safeFileName}
```

Each record had one `original` variant using the same local URL and local-dev storage metadata.

## Forward URL Shape

After this update, each approved MediaAsset uses:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

with:

```text
storageProvider: azure-blob
storageContainer: ice-rink-rentals-media
blobPath: ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Guardrails

Do not roll back with broad tenant-level writes. If rollback is approved, re-read each target record first, verify tenant/site, and patch only the URL/storage fields for the same 9 IDs.

Do not touch page/body CMS content, theme/navigation, forms, Cloudflare, Azure, blobs, deployment, email/Microsoft 365, raw images, generated static artifact staging, or Roller work without separate explicit approval.
