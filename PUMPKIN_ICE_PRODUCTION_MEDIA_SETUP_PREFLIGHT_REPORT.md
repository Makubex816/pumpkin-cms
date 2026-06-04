# Pumpkin Ice Production Media Setup Preflight Report

Date: 2026-06-04

Branch: feature/admin-page-editor-import-export

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Scope

This report records the production media setup preflight for IceSkatingRinkRentals.com.

Preflight only. No production setup or execution occurred.

## Reviewed

Reviewed safe local docs and repo-visible files only:

- `PUMPKIN_ICE_FIRST_EXECUTION_GATE_DECISION_REPORT.md`
- `deployment/azure/ice-first-execution-gate-decision/`
- `PUMPKIN_ICE_PRODUCTION_READINESS_MASTER_PLAN_REPORT.md`
- `deployment/azure/ice-production-readiness-master-plan/`
- `PUMPKIN_ICE_NEXT_GATE_PRODUCTION_MEDIA_AND_FORM_PLANNING_REPORT.md`
- `deployment/azure/ice-production-media-setup-planning/`
- `deployment/azure/ice-static-dry-run-readiness/`
- `ICE_LOCAL_PHASE_CLOSED_NEXT_GATE_HANDOFF.md`
- repo-visible `.local-media` source candidates
- repo-visible raw `content-review` source candidates

Protected config was not read.

## Created

Created media preflight package:

`deployment/azure/ice-production-media-setup-preflight/`

Package files:

- `README.md`
- `REQUIRED_MEDIA_INVENTORY.md`
- `SOURCE_MEDIA_AVAILABILITY.md`
- `TARGET_CDN_URL_MAP.md`
- `AZURE_BLOB_PREFLIGHT.md`
- `CLOUDFLARE_MEDIA_DOMAIN_PREFLIGHT.md`
- `MEDIAASSET_UPDATE_PREFLIGHT.md`
- `MEDIA_VALIDATION_PREFLIGHT.md`
- `APPROVAL_REQUIRED_BEFORE_EXECUTION.md`
- `REMAINING_MEDIA_RISKS.md`
- `NEXT_MEDIA_EXECUTION_PROMPT.md`
- `manifest.json`

## Exact Required Media Inventory

The six strict media file-level errors map to these 9 MediaAsset records:

- `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d`
- `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd`
- `ice-rink-rentals-holidayicerink-973ce7691377`
- `ice-rink-rentals-icerinkrentalssetup-113d218572e4`
- `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411`
- `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d`

Routes affected:

- `/`
- `/contact`
- `/service-areas`

Approved visible imagery should remain in place. The production repair is CDN media publishing plus MediaAsset URL transition, not removing the media fields locally.

## Source Media Availability

All 9 required files are present in:

```text
apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/
```

Eight raw input files currently present hash-match their `.local-media` counterparts. The current PPEC logo file is present in `.local-media`, and older safe docs identify the original replacement source, but that original input path is not currently present in the repo-visible file tree.

Future execution must confirm whether `.local-media` files may be used as upload sources or whether original raw source files should be restored.

## Target CDN URL Plan

Target domain:

```text
media.iceskatingrinkrentals.com
```

Locked target URL pattern:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

The preflight package maps each of the 9 MediaAsset records to a proposed URL using the observed lowercase SHA-256 hash.

## Future Azure, Cloudflare, And MediaAsset Actions

Future Azure Blob actions require explicit approval before:

- selecting or creating a storage account
- creating the media container
- configuring access policy
- uploading files
- setting Blob cache headers

Future Cloudflare actions require explicit approval before:

- creating or changing the `media.iceskatingrinkrentals.com` DNS record
- changing cache or origin behavior
- purging cache

Future MediaAsset actions require explicit approval before:

- reading protected config or using Admin JWT
- updating any CMS or MediaAsset record
- writing production CDN URLs
- changing provider/status/readiness metadata

## Remaining Risks

- Media production URLs are not live.
- Azure Blob storage is not provisioned.
- Cloudflare media hostname is not configured.
- MediaAsset records still use local media URLs.
- The PPEC original replacement source path is documented but not currently present.
- Static form endpoint blockers remain after media is solved.
- Azure staging and DNS cutover remain blocked.

## Readiness Classification

- Static dry run completed: yes
- Static route output ready: yes
- Static output quality gates: no
- Media production URL readiness: no
- Contact form production readiness: no
- Azure staging readiness: no
- DNS cutover readiness: no
- Production/indexing readiness: not live-ready
- Roller: paused

## What Was Not Done

This preflight did not:

- create Azure resources
- create Cosmos resources
- create Blob containers
- change Cloudflare or DNS
- deploy
- upload media
- update CMS records
- update MediaAsset records
- send email
- touch Microsoft 365 settings
- read protected config
- print secret values
- print JWT values
- stage generated static artifacts
- touch Roller

## Next Step

Review `deployment/azure/ice-production-media-setup-preflight/NEXT_MEDIA_EXECUTION_PROMPT.md` and approve only the exact next media execution step when ready.
