# Audit Job Ledger Contract Validation Rules

These rules define the V2.9.6 local/read-only contract layer between the audit-job-ledger package, Admin viewer, future Pumpkin API read-only endpoints, and future Electron consumer.

## Shared Viewer Model

Required fields:

- `schemaVersion`
- `providerMode`
- `readOnly`
- `summary`
- `panels`
- `auditEvents`
- `jobRuns`
- `promotionGates`
- `evidenceBindings`
- `traceIds`
- `warnings`
- `blockers`
- `nextGates`
- `securityBoundary`
- `redactionPolicy`
- `generatedAt`

The shared viewer model must remain read-only, must carry `indexingState: deferred`, must include the 12 required panel IDs, and must expose a satisfied no-write security boundary.

## Read-Only API Envelope

Required fields:

- `ok`
- `requestId`
- `correlationId`
- `providerMode`
- `readOnly`
- `data`
- `warnings`
- `errors`
- `securityBoundary`
- `source`

The envelope may also carry Pumpkin API-style `status`, `code`, `message`, `tenantKey`, `siteKey`, and `meta` fields. Those fields are contract metadata only in V2.9.6; no Pumpkin API endpoint is implemented.

## Validator Hard Stops

The validator rejects:

- missing required contract fields;
- unsupported provider modes;
- `readOnly` not set to true;
- unsatisfied no-write boundary;
- non-empty `securityBoundary.openFlags`;
- missing deferred indexing gate or panel;
- panel entries that are not read-only;
- count mismatches between `summary.counts` and detail arrays;
- mutation-like actions that are enabled or callable;
- secret-like field names or high-confidence secret-like values;
- missing V2.9.5 runtime HTTP warning carryforward.

## Future Boundaries

Future Pumpkin API and Electron work must consume this contract without adding writes. Runtime endpoint implementation, Electron runtime implementation, deployments, indexing, contact POSTs, CMS/provider writes, Azure mutations, RBAC assignments, protected config reads, and token/key/SAS/connection-string actions remain outside V2.9.6.
