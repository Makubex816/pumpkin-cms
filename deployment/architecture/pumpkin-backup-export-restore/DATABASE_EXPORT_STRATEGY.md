# Database Export Strategy

## Export Options

For Azure SQL or equivalent relational storage, the preferred portable export path is a BACPAC or equivalent platform-supported export format. Other engines should provide an equivalent logical dump or snapshot export with schema and data captured consistently.

## Consistency Requirements

- Record export start/end timestamps.
- Record database name or logical environment identifier without secret connection strings.
- Prefer transactionally consistent export.
- Block export during incompatible migrations.
- Mark export as stale if CMS writes continue during export without snapshot isolation.

## Security Requirements

- Database export artifacts are sensitive even without explicit secrets.
- Portable database exports must be encrypted before download or long-term storage.
- Standard backup manifests may reference the encrypted export artifact and checksum.
- No connection strings or storage keys are written to standard backup manifests.

## Restore Testing

- Restore first to local/sandbox database only.
- Validate schema version, tenant count, page count, media count, form count, and route proofs.
- Do not restore into production without separate recovery approval.

## Non-Action

Phase 2F-1 does not run database export commands, inspect connection strings, or create database artifacts.
