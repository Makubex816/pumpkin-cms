# Media Asset Pipeline Azure Readiness

Phase 8C.9 adds a production-shaped MediaAsset pipeline without creating Azure resources or committing secrets.

## Current Local Provider

- `ICE_MEDIA_STORAGE_PROVIDER=local-dev`
- uploads write through the API storage abstraction into the local development media store
- stored records use tenant-scoped `blobPath`, `publicUrl`, checksum, MIME type, dimensions, and lifecycle status
- SVG uploads are blocked until a sanitizer exists
- hard delete is disabled by default

## Future Azure Blob Provider

Use placeholders only until Azure resources are created and approved:

- `ICE_MEDIA_STORAGE_PROVIDER=azure-blob`
- `ICE_MEDIA_STORAGE_ACCOUNT={{AZURE_STORAGE_ACCOUNT_NAME}}`
- `ICE_MEDIA_STORAGE_CONTAINER={{AZURE_STORAGE_CONTAINER_NAME}}`
- `ICE_MEDIA_PUBLIC_BASE_URL={{ICE_MEDIA_PUBLIC_BASE_URL}}`
- `ICE_MEDIA_UPLOAD_MAX_MB={{ICE_MEDIA_UPLOAD_MAX_MB}}`

Do not commit connection strings, account keys, SAS tokens, deployment tokens, or CDN secrets.

## Target Shape

- Azure Blob Storage container for tenant-approved media assets
- public base URL served through the Static Web Apps compatible domain or a future media domain
- optional CDN/custom media domain after staging approval
- lifecycle rules for archived/replaced assets after page references are removed
- checksum-based safe file names to avoid unsafe user-provided names and accidental overwrites

## Operational Rules

- upload through the authenticated admin API only
- keep `tenantId` and `siteKey` on every MediaAsset
- block cross-tenant asset selection in the Media Picker
- warn when archived/replaced assets are referenced by page JSON
- require alt text unless an image is explicitly decorative
- keep generated static packages free of embedded base64 image blobs
