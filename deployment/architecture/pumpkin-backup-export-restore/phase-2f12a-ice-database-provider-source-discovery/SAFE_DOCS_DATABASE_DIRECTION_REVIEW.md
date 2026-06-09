# Safe Docs Database Direction Review

## Reviewed Safe Docs

- `deployment/azure/ice-production-architecture/COSMOS_DB_PRODUCTION_DATA_PLAN.md`
- `deployment/architecture/pumpkin-backup-export-restore/phase-2f10a-ice-source-wiring-tenant-bundle-plan/DATABASE_BACKUP_SOURCE_PLAN.md`
- `deployment/architecture/pumpkin-backup-export-restore/phase-2f10a-ice-source-wiring-tenant-bundle-plan/ICE_SOURCE_OF_TRUTH_MAP.md`
- `deployment/architecture/pumpkin-backup-export-restore/phase-2f10b-cosmos-media-connector-implementation-plan/COSMOS_READ_ONLY_DISCOVERY_PLAN.md`
- `deployment/architecture/pumpkin-backup-export-restore/phase-2f12-ice-live-readonly-connector-preflight/manifest.json`
- `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12_ICE_LIVE_READONLY_CONNECTOR_PREFLIGHT_REPORT.md`

## Database Direction

The safe docs consistently identify Azure Cosmos DB as the intended Ice CMS production data direction. The docs also preserve provider awareness because the app supports Cosmos DB and MongoDB, and prior Azure SQL discovery did not identify SQL as the source.

## Important Distinction

The production data plan describes Cosmos DB as planned production storage, but Phase 2F-12 and Phase 2F-12A did not find a live Cosmos account in the accessible Azure scope. Therefore, Cosmos is the expected/intended direction, not a proven live account/source.

## Backup Implication

Backup Center should continue to treat the database source as unresolved until one of these is available:

- owner-confirmed Cosmos account/resource group/subscription scope;
- a safe non-secret runtime metadata endpoint;
- provider env presence plus non-secret identifiers;
- Azure RBAC visibility of the correct Cosmos/provider resource.
