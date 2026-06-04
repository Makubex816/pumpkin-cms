# MediaAsset Production Fields

Required production MediaAsset fields:

- `assetId`
- `tenantId`
- `siteKey`
- `status`
- `storageProvider`
- `cdnProvider`
- `originalFileName`
- `safeFileName`
- `checksum`
- `width`
- `height`
- `mimeType`
- `sourceBlobPath`
- `publicUrl`
- `thumbnailUrl`
- `variants`
- `altText`
- `title`
- `caption`
- `description` or `notes`
- `usageType`
- `tags`
- `createdAt`
- `updatedAt`
- `archivedAt` if archived
- `replacedByAssetId` if replaced

Required production values:

- `storageProvider`: `azure-blob`
- `cdnProvider`: `cloudflare`

Production validation gates:

- Fail if required media still points to localhost.
- Fail if `publicUrl` is missing for required renderable media.
- Fail if media checksum is missing.
- Fail if binary dimensions or MIME type are unknown for image media.
- Fail if required alt text is missing for non-decorative imagery.
- Fail if archived or replaced assets are still used by live pages without approval.
