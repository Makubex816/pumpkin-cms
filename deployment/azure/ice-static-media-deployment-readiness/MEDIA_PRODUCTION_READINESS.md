# Media Production Readiness

## Current Media State

Prior read-only MediaAsset snapshots show active Ice assets still using local development media paths:

- storage providers include `local-dev`
- CDN provider is missing
- page media URLs use `/media/ice-rink-rentals/2026/06/...`
- no media URLs use `https://media.iceskatingrinkrentals.com/...`

The PPEC logo and approved page images are bound and visually approved locally, but they are not production media URLs yet.

## Page Media URL Summary

| Page | Local `/media` URLs | Production media-domain URLs |
| --- | --- | --- |
| home | yes | no |
| contact | yes | no |
| service-areas | yes | no |

## Production Contract

The locked production architecture expects media to use:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Expected production metadata includes:

- `storageProvider`: `azure-blob`
- `cdnProvider`: `cloudflare`
- production `publicUrl`
- production blob/source path
- checksum/versioned path support

## Readiness Result

Ready for production media URLs: no.

The next gate is a separate media publication task that uploads approved binaries to Blob Storage and updates MediaAsset metadata after explicit authorization.

