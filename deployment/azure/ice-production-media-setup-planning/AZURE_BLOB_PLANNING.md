# Azure Blob Planning

Generated: 2026-06-04

## Scope

This file plans the future Azure Blob media storage gate.

No Azure Storage account, Blob container, or Blob upload was created.

## Planned Responsibility

Azure Blob Storage should store production media binaries for IceSkatingRinkRentals.com. MediaAsset metadata remains in Pumpkin/Cosmos, and Cloudflare fronts the media hostname.

## Planned Path Convention

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Future Setup Checklist

After explicit approval:

1. Select or create the production Azure Storage account.
2. Create the approved media Blob container.
3. Configure access model and origin access.
4. Upload approved binaries under checksum-versioned paths.
5. Verify uploaded checksums against approved asset metadata.
6. Apply cache headers for immutable versioned image paths.
7. Record `sourceBlobPath` and production `publicUrl` in MediaAsset records.

## Cache Header Target

For checksum-versioned media:

```text
Cache-Control: public, max-age=31536000, immutable
```

## Required Explicit Approvals

Approval is required before:

- creating storage resources
- creating containers
- uploading binaries
- changing access policies
- writing MediaAsset metadata
- marking media production readiness `yes`

## Not Performed

- no Azure resources created
- no Blob containers created
- no media uploaded
- no storage keys read or printed
- no connection strings read or printed

