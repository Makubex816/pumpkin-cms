# Implementation Scope

## Approved Scope For This Phase

Phase 2F-10B is limited to implementation planning for future Backup Center connectors:

- Cosmos/provider database source discovery plan.
- Cosmos platform backup evidence plan.
- Portable Cosmos JSON export plan.
- Azure Blob/media connector plan.
- Tenant website bundle integration plan.
- Environment and tooling readiness matrix.
- Manifest, checksum, validator, and restore-plan contract updates.
- Implementation batches and tests for a later approval.
- Next approval prompt for connector implementation.

## Future Code Locations

The future connector implementation should live under:

- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/src/connectors/cosmos/`
- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/src/connectors/media/`
- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/src/profiles/`
- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/src/bundles/`
- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/test/`
- `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/fixtures/`

Generated backup and restore validation output must remain under ignored `.tmp` folders.

## Future CLI Surface

The future implementation should add commands that can run in explicit profiles only:

- `discover-cosmos-source`
- `collect-cosmos-platform-evidence`
- `export-cosmos-json`
- `discover-media-source`
- `build-media-blob-map`
- `collect-media-inventory`
- `copy-media-blobs`
- `create-ice-website-bundle`
- `validate --mode production-restore-proof`
- `restore-plan --mode tenant-website-bundle`

Each command must support a dry-run or discovery-only mode before any export or copy mode is allowed.

## Deliverables For A Later Implementation Phase

- Provider profile resolver.
- Cosmos read-only discovery connector.
- Cosmos platform backup evidence writer.
- Tenant-scoped portable JSON export connector.
- Media source discovery connector.
- Blob inventory and optional blob copy connector.
- Tenant website bundle writer.
- Manifest/checksum integration.
- Validator contract updates.
- Restore-plan contract updates.
- Fixtures and tests.

No implementation is included in Phase 2F-10B.
