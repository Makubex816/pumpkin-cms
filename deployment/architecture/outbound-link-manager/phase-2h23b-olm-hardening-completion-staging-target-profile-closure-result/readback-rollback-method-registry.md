# Readback And Rollback Method Registry

Current state: registry requirements are documented; real methods are not supplied.

Required readback method:

- Must be concrete for the real scoped staging provider.
- Must read back only the approved tenant/site scope.
- Must verify the expected 48 records by entity type and ID.
- Must verify `/tenantKey` or equivalent tenant partition behavior if the provider uses partitions.
- Must not require keys, connection strings, SAS, protected config, or secret export.

Required rollback method:

- Must be tied to first-write batch `olbatch_b08e184fdc6565aa`.
- Must identify all written records by approved manifest IDs.
- Must define stop/abort rules for partial writes, conflicts, or readback mismatches.
- Must have Backup Center pre-write evidence available before execution.
- Must not target production.

Current unresolved contract fields:

- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

Readback run in this pass: `false`.

Rollback executed in this pass: `false`.

