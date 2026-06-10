# Schema Contracts

The migration schema contracts are local JavaScript validators rather than a production database migration. They verify that the generated JSON package is internally consistent and safe to hand to a future staging persistence preflight.

## File Contracts

The validator requires every production entity file under `production-records/`, plus:

- `migration-manifest.json`
- `checksums.json`
- `checksums.sha256`
- `ROLLBACK_PACKAGE.md`
- `RESOURCE_REGISTRY_UPDATE_CANDIDATE.json`
- `BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md`

## Record Contracts

The validator checks that each record:

- parses as JSON inside an entity envelope
- has tenant/site scope and `/tenantKey` partition semantics
- includes source IDs, target IDs, migration IDs, and state hashes
- uses the expected entity collection
- keeps `dryRunOnly: true` and `liveWriteAllowed: false`
- avoids secret-like values, JWTs, connection strings, SAS-like values, and unredacted risky URL query values
- preserves trace fields required for request/action/entity/audit/rollback/readback correlation

## Cross-Record Contracts

References are validated between links, instances, and render decisions. Manifest counts must match the entity files. Checksums must match generated files. State hash fields must be SHA-256 shaped.

The validator writes `VALIDATION_RESULT.json` and `VALIDATION_RESULT.md`.
