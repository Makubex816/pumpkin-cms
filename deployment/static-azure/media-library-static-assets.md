# Media Library And Static Assets

## Purpose

The Phase 6K Media Library is a tenant-scoped metadata registry for public image assets. It does not upload binary files, copy images, create Azure Storage containers, deploy to Azure, or change Cloudflare.

The MVP tracks existing image URLs so production pages can consistently manage:

- alt text
- source/source URL
- license and usage status
- dimensions
- focal point
- decorative flag
- tags and notes
- page usage references

## Data Model

Media assets are stored as `MediaAsset` records partitioned by `tenantId`.

Required local Cosmos container:

```text
Container: MediaAsset
Partition key: /tenantId
```

The record stores metadata only. The `url` can be a public `http(s)` URL or a site-root-relative path. Local config paths, `.env` references, `appsettings` references, `file:` URLs, `javascript:` URLs, and data URLs are rejected by the API sanitizer.

## URL-Based MVP

Admins register an existing URL from `/dashboard/media`. The asset preview uses that URL directly. This phase intentionally avoids production binary hosting so no Azure Blob, Storage, CDN, or credentials are needed.

Future production asset hosting can add:

- Azure Blob or Azure Storage-backed uploads
- image resizing/optimization
- CDN URLs
- signed administrative uploads
- malware scanning and moderation
- automated dimension extraction

## License And Usage Status

`licenseStatus` supports:

```text
unknown
needs_review
approved
rejected
owned
licensed
ai_generated
partner_provided
```

`usageStatus` supports:

```text
unused
in_use
needs_review
approved_for_publish
```

Assets used on published pages should not remain `unknown` or `needs_review`.

## Alt Text And Decorative Images

Non-decorative assets should have meaningful alt text before production publishing.

If an image is genuinely decorative, set `decorative = true`. Decorative assets do not require alt text, but license/source status still matters.

## Focal Point

The MVP stores `focalPoint.x` and `focalPoint.y` as values from `0` to `1`.

Future image rendering can use these values to improve cropping for hero images, local rink images, and closing images.

## Page Editor Integration

The page editor already exposes page-level media slots with `assetId`, `url`, `alt`, source, license, usage, dimensions, focal point, and decorative fields.

Phase 6K adds guidance in the page editor:

1. Register the image URL in Media.
2. Copy the MediaAsset `assetId`, URL, and alt text into the page media slot.
3. Save the page through the existing revision/rollback update path.

A full picker is intentionally deferred.

## Static Publishing Implications

Static export remains URL-based. No media files are copied into static artifacts during Phase 6K.

Static validation now warns when page-level media has a URL but no `assetId`, which means the page image is not clearly tied to a Media Library record.

These warnings are advisory for now. They should become stricter before final production publishing.

## Future Azure/CDN Workflow

The recommended future path is:

1. Upload approved assets to Azure Blob or Storage.
2. Serve through Cloudflare/CDN.
3. Store the final public CDN URL on `MediaAsset.url`.
4. Reference the `assetId` from page media slots.
5. Keep source/license and usage history in CMS.
