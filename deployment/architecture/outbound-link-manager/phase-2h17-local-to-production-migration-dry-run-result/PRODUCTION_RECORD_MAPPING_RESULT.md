# Production Record Mapping Result

The mapper generated all required production-shaped entity files under `.tmp/phase-2h17-migration-dry-run/production-records`.

Each candidate record includes tenant/site scope, `/tenantKey` partition value, source and target IDs, migration IDs, target container metadata, dry-run boundary flags, before/after hashes, and a final migration record hash.

Trace-log candidates include request IDs, action IDs, correlation IDs, entity IDs, audit IDs, rollback IDs, affected page/instance IDs, provider mode, before/after hashes, and outcome.

The generated records remain local JSON candidates only and were not written to a live provider.

