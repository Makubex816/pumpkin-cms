# Admin View Model Mapping

The Admin view model maps the V2.9.3 viewer model into UI-friendly records.

## Types

- `AuditJobLedgerViewerModel`
- `AuditJobLedgerAdminSnapshot`
- `AuditJobLedgerAdminRecord`
- `AuditJobLedgerQueryState`
- `AuditJobLedgerFutureAction`

## Record Kinds

- `audit_event`
- `job_run`
- `promotion_gate`
- `evidence_binding`
- `trace_id`

## Required Fields

The provider preserves `summary`, `panels`, `auditEvents`, `jobRuns`, `promotionGates`, `evidenceBindings`, `traceIds`, `warnings`, `blockers`, `nextGates`, and `securityBoundary`.
