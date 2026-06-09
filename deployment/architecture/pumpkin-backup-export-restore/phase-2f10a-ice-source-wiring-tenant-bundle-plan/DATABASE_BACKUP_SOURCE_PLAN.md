# Database Backup Source Plan

## Current Finding

Phase 2F-10 expected a database artifact but lacked env/tool readiness. Phase 2F-10A read-only discovery found:

- no Azure SQL servers in the current Azure subscription context;
- app source supports provider-routed database access through `DatabaseService`;
- database providers in source/docs are Cosmos DB and MongoDB;
- Ice production architecture docs identify the CMS database provider as `azure-cosmos-db`.

Therefore, the database source plan must be provider-aware. Do not assume Azure SQL for Ice until a later discovery pass proves Azure SQL is the live source.

## Source Definition

Primary expected live DB source for Ice:

- provider: Azure Cosmos DB, based on safe production architecture docs;
- logical database/container details: not confirmed in this phase;
- tenant partition: `ice-rink-rentals` by model and Cosmos partition key convention;
- source access: future approved read-only database discovery or platform backup evidence.

Fallback/provider possibilities:

- MongoDB if production config selects MongoDB;
- Azure SQL only if future approved discovery identifies an SQL server/database as the live provider.

## Connector Strategy

Implement database backup connectors in this order:

1. `database-provider-discovery`: determines provider from approved non-secret runtime/config inventory or read-only API endpoint.
2. `cosmos-readonly-inventory`: lists database/container metadata and tenant-scoped counts without keys in reports.
3. `cosmos-export-evidence`: records automatic backup policy/point-in-time restore evidence when approved.
4. `cosmos-logical-export`: exports tenant-scoped documents to encrypted/ignored output when separately approved.
5. `mongo-export-evidence`: future equivalent if MongoDB is selected.
6. `azure-sql-bacpac-export`: optional future connector only if Azure SQL is confirmed.

## Required Future Env/Tooling

Presence-only candidate names:

- `PUMPKIN_DATABASE_PROVIDER`
- `PUMPKIN_COSMOS_ACCOUNT_NAME`
- `PUMPKIN_COSMOS_DATABASE_NAME`
- `PUMPKIN_COSMOS_CONTAINER_PREFIX`
- `PUMPKIN_COSMOS_AUTH_MODE`
- `PUMPKIN_COSMOS_EXPORT_OUTPUT_DIR`
- `PUMPKIN_COSMOS_EXPORT_ENCRYPTION_METHOD`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_SQL_SERVER_NAME`
- `AZURE_SQL_DATABASE_NAME`
- `SQLPACKAGE_PATH`

Values must never be printed or written.

## Production Restore Proof Rule

Production restore proof remains blocked until the selected live DB provider has either:

- approved provider backup evidence; or
- an approved portable/export artifact with checksums and restore validation.

