# Cosmos Database Backup Direction

## Direction

The Ice database backup connector should be designed around Cosmos/provider-based storage as the primary production path.

Azure SQL/BACPAC handling should remain optional fallback work only if a later approved read-only discovery run proves that a SQL database is actually part of the live Ice source-of-truth stack.

## Backup Evidence Layers

The database backup strategy needs two complementary layers:

1. Platform backup evidence.
2. Portable tenant-scoped JSON export.

Platform backup evidence proves the cloud service has a provider-native recoverability story. Portable JSON export proves Pumpkin can carry tenant content into a standard backup bundle and validate a future restore plan without relying only on a cloud-account-level restore.

## Provider Abstraction

The future connector should keep a provider-neutral contract:

- `provider`: expected value `cosmos` for Ice unless discovery proves otherwise.
- `sourceProfile`: `fixture`, `local-dev`, `azure-readonly`, or `azure-export-approved`.
- `databaseIdentity`: non-secret account, database, and container identifiers.
- `tenantScope`: tenant and site keys used to constrain export.
- `capabilities`: discovery, platform evidence, portable export, restore planning.

Cosmos-specific details should be isolated behind connector modules, not spread through the backup runner.

## Backup Completeness Rule

Ice should not be marked fully backupable until both conditions are satisfied:

- Cosmos platform backup evidence is captured or a blocker is documented.
- Tenant-scoped portable JSON export is produced, checksummed, validated, and included in the restore-plan dry run.
