# Trace Continuity

The apply-plan trace-continuity validator verifies that every apply-plan record can be traced back to the migration dry-run source record.

## Required Fields

Each apply-plan record must contain request, action, correlation, migration, provider, apply-plan, tenant/site, target entity, source/target ID, entity-specific IDs, audit IDs, rollback ID, affected page/instance IDs, before/after hashes, migration hash, outcome, block reason, and validation result ID.

## Hash Continuity

The validator compares `migrationRecordHash` against the source migration collection, target entity, migration record ID, and target record ID. This avoids false matches because migration trace-log records intentionally reference the same source `migrationRecordId` as the production candidate they describe.

## Boundaries

Trace continuity is local evidence only. It does not write trace logs to a provider and does not read any protected configuration.

