# Media Connector Fake Mode

Phase 2F-11 implements a fixture-only Azure Blob media connector foundation.

## What It Writes

Fake mode writes:

- `media/blob-map/blob-inventory.json`
- `media/blob-map/blob-copy-plan.json`
- `media/blob-map/blob-map.json`
- `media/blob-map/blob-checksums.sha256`
- `media/blobs/ice/*.txt`
- `media/MEDIA_BLOBS_INCLUDED_FAKE.md`

The copied files are tiny checked-in text fixtures. They are not real blobs and are not downloaded from Azure.

## Known Source Modeled By The Fixture

- Storage account: `iceskatingmedia`
- Resource group: `rg-ice-production-media`
- Container: `ice-rink-rentals-media`
- Public host: `media.iceskatingrinkrentals.com`

These are modeled as metadata only. No Azure command is run.

## What It Does Not Do

- No live blob listing.
- No real blob download.
- No blob upload.
- No storage key, connection string, or SAS value.
- No MediaAsset write.
- No CMS write.

## Fixture Inputs

- `fixtures/fake-media-blob-inventory.ice.json`
- `fixtures/fake-media-blob-copy-plan.ice.json`
- `fixtures/fake-media-blob-copy-source-files/*.txt`

Production blob inventory/copy remains a future approval gate.
