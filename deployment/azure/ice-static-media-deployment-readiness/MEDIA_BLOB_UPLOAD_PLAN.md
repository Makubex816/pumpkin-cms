# Media Blob Upload Plan

## Goal

Move approved Ice media binaries from local development serving into Azure Blob Storage for later Cloudflare-fronted production and staging use.

## Planned Steps

1. Confirm approved MediaAsset inventory from the latest homepage, contact, and service-area readbacks.
2. Confirm each asset has checksum, file extension, mime type, dimensions, alt text, and usage status.
3. Upload approved binaries to Azure Blob Storage under the locked path convention.
4. Confirm uploaded blob checksums match approved local MediaAsset checksums.
5. Set immutable cache headers for checksum-versioned image paths.
6. Update MediaAsset metadata to `storageProvider=azure-blob` and `cdnProvider=cloudflare`.
7. Update each MediaAsset production `publicUrl`.
8. Re-read CMS pages and verify no local `/media/...` URLs remain in production-bound fields.
9. Run static export validation after media URLs are production-safe.

## Not Performed

- No Azure Blob container was created.
- No blobs were uploaded.
- No MediaAsset records were changed.
- No CMS pages were changed.
- No static package was generated.

## Blocker

Blob/media production setup has not been authorized or provisioned yet.

