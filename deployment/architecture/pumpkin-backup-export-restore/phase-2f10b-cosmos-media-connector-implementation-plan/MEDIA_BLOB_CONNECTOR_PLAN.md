# Media Blob Connector Plan

## Purpose

The media connector should prove and optionally collect the media blobs required to restore IceSkatingRinkRentals.com pages, while keeping blob copy/download work behind a later explicit approval.

## Known Source From Phase 2F-10A

- Storage account: `iceskatingmedia`
- Resource group: `rg-ice-production-media`
- Container: `ice-rink-rentals-media`
- Public host: `media.iceskatingrinkrentals.com`

## Proposed Modules

- `src/connectors/media/media-profile.mjs`
- `src/connectors/media/media-source-discovery.mjs`
- `src/connectors/media/media-asset-blob-map.mjs`
- `src/connectors/media/azure-blob-inventory.mjs`
- `src/connectors/media/azure-blob-copy-planner.mjs`
- `src/connectors/media/azure-blob-copy-runner.mjs`
- `src/connectors/media/media-bundle-writer.mjs`

## Connector Modes

- `metadata-only`: use CMS/DB MediaAsset records and public URLs only.
- `inventory-only`: list blob names/properties without downloading content, if later approved.
- `local-copy`: download approved blobs into ignored `.tmp` backup output, if later approved.
- `storage-copy`: copy approved blobs to an approved backup storage target, if later approved.

Phase 2F-10B approves planning only and runs none of these modes.

## Blob Map Contract

The blob map should connect CMS content to physical media artifacts:

```json
{
  "contractVersion": "1.0",
  "site": "ice",
  "source": {
    "provider": "azure-blob",
    "storageAccount": "iceskatingmedia",
    "container": "ice-rink-rentals-media",
    "publicHost": "media.iceskatingrinkrentals.com"
  },
  "assets": [
    {
      "mediaAssetId": "fixture-id",
      "cmsUrl": "https://media.iceskatingrinkrentals.com/path/file.jpg",
      "blobName": "path/file.jpg",
      "expectedContentType": "image/jpeg",
      "copyStatus": "not-run",
      "checksum": null
    }
  ]
}
```

## Bundle Outputs

```text
tenants/{tenantKey}/sites/{siteKey}/media/metadata/
  media-assets.json
  media-source-discovery.json
tenants/{tenantKey}/sites/{siteKey}/media/blob-map/
  blob-map.json
  blob-inventory.json
tenants/{tenantKey}/sites/{siteKey}/media/blobs/
  ...
```

`media/blobs/` remains optional until blob copy/download is explicitly approved and successfully validated.

## Completion Rule

Ice media should not be marked production-restore-proof until one of these is true:

- All referenced blobs are copied into the standard backup bundle and checksummed.
- A provider-native media backup/copy evidence package is captured and accepted by owner decision.
- A documented blocker explains why the backup is incomplete.
