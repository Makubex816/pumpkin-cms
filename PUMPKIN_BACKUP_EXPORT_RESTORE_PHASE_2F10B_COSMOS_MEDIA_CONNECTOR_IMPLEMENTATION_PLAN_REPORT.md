# Pumpkin Backup Export/Restore Phase 2F-10B Report

## Objective

Create the IceSkatingRinkRentals.com Cosmos/media backup connector implementation plan using the Phase 2F-10A source-of-truth findings, with Cosmos/provider-based storage treated as the likely production database direction instead of Azure SQL.

## Result

- Phase 2F-10A source wiring plan: complete
- Phase 2F-10B connector implementation plan: yes
- Ice fully backupable today: no
- Cosmos/database connector plan: yes
- Media blob connector plan: yes
- Tenant website bundle integration plan: yes
- Ready for connector implementation approval: yes
- Implementation performed: no
- External systems changed: no
- Live pages affected: no

## Package

Created planning package:

```text
deployment/architecture/pumpkin-backup-export-restore/phase-2f10b-cosmos-media-connector-implementation-plan/
```

The package contains the requested scope, non-goals, 2F-10A findings summary, Cosmos direction, read-only discovery plan, platform backup evidence plan, portable JSON export plan, media blob connector plan, tenant website bundle integration plan, local/live profile plan, readiness matrix, manifest/checksum plan, validator update plan, restore-plan update plan, implementation batches, test fixture plan, risk register, next implementation prompt, and package manifest.

## Database Direction

Phase 2F-10A evidence makes Azure SQL a fallback assumption, not the primary Ice database backup path. Phase 2F-10B plans for:

- Cosmos/provider read-only source discovery.
- Cosmos platform backup evidence.
- Tenant-scoped portable Cosmos JSON export.
- Validator and restore-plan updates that require clear completeness states.

Ice should not be marked fully backupable until platform evidence and portable export are implemented, checksummed, validated, and included in the restore-plan dry run.

## Media Direction

The media connector plan uses the Phase 2F-10A source:

- Storage account: `iceskatingmedia`
- Resource group: `rg-ice-production-media`
- Container: `ice-rink-rentals-media`
- Public host: `media.iceskatingrinkrentals.com`

The plan separates metadata-only, inventory-only, local-copy, and provider-native copy evidence modes. No blob listing or download was performed in this phase.

## Tenant Website Bundle

The plan extends the Phase 2F-10A public_html-style tenant bundle with:

- `database/cosmos-json/`
- `database/platform-evidence/cosmos/`
- `media/metadata/`
- `media/blob-map/`
- `media/blobs/`
- `backups/`
- `restore/`
- `operator-handoff/`
- `manifests/`

Bundle manifests and checksums must distinguish complete, partial, blocked, not-run, and excluded components.

## Readiness And Gates

Ready for a later connector implementation approval decision: yes.

Not approved in this phase:

- Connector implementation.
- Cosmos export.
- Blob listing or download.
- Protected config reads.
- Secret export.
- CMS writes.
- Azure mutation.
- Deployment.
- Search Console/indexing.
- Live-page publication.

## Go/No-Go Recommendation

Recommendation: go for a future Phase 2F-11 connector foundation implementation approval, limited to fixture-first connector code, profile resolution, presence-only readiness checks, manifest/checksum/validator/restore-plan updates, and tests.

Recommendation: no-go for claiming Ice fully production-restore-proof today. The database and media connectors still need implementation and approved execution before that claim is valid.
