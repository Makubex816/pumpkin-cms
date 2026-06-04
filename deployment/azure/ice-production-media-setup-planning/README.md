# Ice Production Media Setup Planning

Generated: 2026-06-04

## Scope

This package plans the future production media setup gate for IceSkatingRinkRentals.com.

Planning only. No Azure resources, Cosmos resources, Blob containers, Cloudflare DNS records, CMS records, MediaAsset records, uploads, deployments, protected config, secrets, email, Microsoft 365 settings, or Roller records were touched.

RollerRinkRentals.com remains paused.

## Current State

The Ice local static dry-run phase is closed.

Confirmed route proof:

- snapshot slugs: `contact`, `home`, `service-areas`
- approved routes: `/`, `/contact`, `/service-areas`
- preview/obsolete deployable paths: 0
- `npm run validate:snapshot:ice`: pass

Remaining media blocker:

- local body/media URLs still render from approved visible page imagery
- the URLs are tied to Ice `mediaAssetId` values
- clearing them locally would remove visible approved imagery
- media production URL readiness remains `no`

## Target Contract

Target media domain:

```text
media.iceskatingrinkrentals.com
```

Target public URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Target storage path pattern:

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Package Files

- `MEDIA_ASSET_INVENTORY.md`
- `MEDIA_URL_TARGETS.md`
- `AZURE_BLOB_PLANNING.md`
- `CLOUDFLARE_MEDIA_DOMAIN_PLANNING.md`
- `MEDIA_VALIDATION_PLAN.md`
- `APPROVAL_CHECKLIST.md`
- `REMAINING_RISKS.md`
- `manifest.json`

## Required Future Approvals

Explicit approval is required before:

- creating Azure Storage
- creating Blob containers
- uploading media
- changing Cloudflare DNS or cache rules
- updating MediaAsset records
- updating CMS records
- marking media production URL readiness `yes`
- rerunning strict validation as a production-media pass

## Readiness

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| static output quality gates | no |
| media production URL readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |

