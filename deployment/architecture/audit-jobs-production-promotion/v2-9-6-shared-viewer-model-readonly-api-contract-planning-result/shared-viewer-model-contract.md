# Shared Viewer Model Contract

Status: implemented locally in `src/audit-job-ledger-contract.mjs`.

Schema version: `audit-job-ledger-shared-viewer-model.v1`.

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

The contract wraps the V2.9.3 viewer model and adds provider mode, read-only assertion, redaction policy, and generated timestamp. It keeps the existing panel/detail arrays stable for Admin while giving future API and Electron consumers an explicit schema boundary.

Validation requires read-only state, deferred indexing, all 12 panels, no open security flags, count consistency, and no enabled mutation action.
