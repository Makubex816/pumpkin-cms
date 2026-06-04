# Azure Blob Media Plan

Azure Blob Storage stores production media/image binaries.

Media responsibilities:

- Azure Blob Storage stores the binary files.
- Cosmos DB stores MediaAsset metadata.
- Cloudflare fronts the media subdomain for CDN/cache behavior.
- Production media URLs do not use localhost `/media` paths.
- Production pages do not use fake URLs.
- Production pages do not use base64 media.
- Production pages do not use unapproved external media URLs.

Production media URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Blob path guidance:

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Publishing media flow:

1. Validate approved MediaAsset metadata.
2. Upload approved binaries to Azure Blob.
3. Store production `sourceBlobPath`.
4. Store production `publicUrl`.
5. Validate Cloudflare media URL behavior.
6. Generate static site only after all required media URLs are production-ready.

Provisioning status: planned, not provisioned.
