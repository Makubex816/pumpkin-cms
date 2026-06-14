# V2.9.3 Carryforward

V2.9.4 carries forward the V2.9.3 local viewer-model foundation.

## Carried Forward

- Viewer model version: `audit-job-ledger-viewer.v1`.
- Required summary fields.
- Required 12 panels.
- Detail arrays for audit events, job runs, promotion gates, evidence bindings, and trace IDs.
- Warning, blocker, next-gate, and security-boundary states.
- `viewer-summary` CLI behavior.
- Google/Search Console/indexing deferred state.

## Admin Binding

The Admin provider maps the same local combined ledger fixture into typed Admin view-model records for rendering at `/dashboard/audit-jobs`.
