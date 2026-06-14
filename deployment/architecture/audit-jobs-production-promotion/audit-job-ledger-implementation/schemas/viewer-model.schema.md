# Viewer Model Shape

Status: V2.9.3 planning schema note.

This file is a human-readable contract for the local read-only viewer model. It is not a runtime JSON Schema and it does not introduce write behavior.

## Top-Level Object

- `ok`: boolean result from ledger validation.
- `viewerModelVersion`: currently `audit-job-ledger-viewer.v1`.
- `summary`: operator summary object.
- `panels`: read-only panel metadata.
- `auditEvents`: audit event detail rows.
- `jobRuns`: job run detail rows.
- `promotionGates`: promotion gate detail rows.
- `evidenceBindings`: evidence binding detail rows.
- `traceIds`: trace explorer model.
- `warnings`: warning rows.
- `blockers`: blocker rows.
- `nextGates`: future gate rows.
- `securityBoundary`: compact no-write boundary view.
- `validation`: validator failures preserved for operator inspection.

## Summary

Required fields:

- `status`
- `v2Reference`
- `laneId`
- `tenantKey`
- `siteKey`
- `releaseState`
- `indexingState`
- `boundaryState`

## State Vocabulary

Allowed operator state labels:

- `read_only`
- `complete`
- `warning`
- `blocked`
- `deferred`
- `missing_evidence`
- `invalid_ledger`
- `future_boundary_required`

## Trace Explorer

`traceIds.entries` contains one row per event trace field with the field name, value, source audit event, event type, correlation ID, and normalized `searchText`.

`traceIds.byField`, `traceIds.correlationIds`, and `traceIds.searchableFields` are derived indexes for a future Admin/API/Electron viewer. They are local-only and contain no live lookup behavior.
