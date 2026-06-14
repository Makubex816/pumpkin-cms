# Read-Only Viewer Model

Status: V2.9.3 local foundation.

`src/audit-job-ledger-view-model.mjs` derives a read-only operator viewer model from a local audit/job ledger object. The transform is pure local JavaScript: it validates the ledger, groups records into operator panels, and exposes search-friendly trace entries without writing files or opening network connections.

## Public API

- `createLedgerViewerModel(ledger)` returns the complete viewer model.
- `searchTraceIds(viewerModel, query)` returns matching trace entries from the derived model.

## Required Summary Fields

The model includes:

- `summary.status`
- `summary.v2Reference`
- `summary.laneId`
- `summary.tenantKey`
- `summary.siteKey`
- `summary.releaseState`
- `summary.indexingState`
- `summary.boundaryState`

It also includes `panels`, `auditEvents`, `jobRuns`, `promotionGates`, `evidenceBindings`, `traceIds`, `warnings`, `blockers`, `nextGates`, and `securityBoundary`.

## Panels

The model emits these read-only panels:

- Release Summary
- Promotion Gates
- Job Runs
- Audit Events
- Evidence Bindings
- Trace Explorer
- Runtime QA
- Resource Registry / Provider Profile
- Outbound Link Manager
- Backup Center
- Indexing Deferred
- Blockers and Next Gates

Panel states are limited to the V2.9.3 state vocabulary: `read_only`, `complete`, `warning`, `blocked`, `deferred`, `missing_evidence`, `invalid_ledger`, and `future_boundary_required`.

## Safety Boundary

The viewer model is informational only. It does not provide Admin UI actions, Pumpkin API endpoints, Electron runtime bindings, deployment actions, indexing actions, crawling, contact form submissions, CMS/provider writes, Azure mutations, protected config reads, tokens, keys, connection strings, or SAS generation.

Invalid ledgers remain visible as read-only data with `summary.status: invalid_ledger`, validation warnings, and an `INVALID_LEDGER` blocker.
