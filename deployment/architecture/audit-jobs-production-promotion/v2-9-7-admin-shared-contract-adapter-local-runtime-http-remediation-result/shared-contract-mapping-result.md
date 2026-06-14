# Shared Contract Mapping Result

Status: passed.

Mapping:

- `envelope.schemaVersion` -> Admin contract metadata `envelopeSchemaVersion`.
- `envelope.providerMode` -> Admin contract metadata `envelopeProviderMode`.
- `envelope.readOnly` -> adapter guard and Admin metadata.
- `envelope.data.summary` -> Admin viewer model summary.
- `envelope.data.panels` -> Admin panel grid.
- `envelope.data.auditEvents` -> Admin audit event records.
- `envelope.data.jobRuns` -> Admin job run records.
- `envelope.data.promotionGates` -> Admin promotion gate records.
- `envelope.data.evidenceBindings` -> Admin evidence records.
- `envelope.data.traceIds` -> Admin trace explorer records.
- `envelope.data.securityBoundary` -> Admin safety banner.
- `envelope.meta.runtimeHttpWarning` -> Admin contract metadata.

Admin-specific provider mode remains `admin-local-fixture-readonly`, while the source envelope provider mode remains `local-fixture-readonly`.

