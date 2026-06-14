# Dashboard Panel Model

Each panel is emitted as a compact read-only metadata row.

## Fields

- `id`: stable panel identifier.
- `title`: operator-facing title.
- `state`: state from the approved vocabulary.
- `readOnly`: always `true`.
- `counts`: panel-specific aggregate counts.
- `safetyLabel`: currently `read_only_no_write_actions`.

## Required Panel IDs

- `release-summary`
- `promotion-gates`
- `job-runs`
- `audit-events`
- `evidence-bindings`
- `trace-explorer`
- `runtime-qa`
- `resource-registry-provider-profile`
- `outbound-link-manager`
- `backup-center`
- `indexing-deferred`
- `blockers-next-gates`

## Combined Fixture State

- Release Summary: `complete`
- Promotion Gates: `complete`
- Job Runs: `complete`
- Audit Events: `complete`
- Evidence Bindings: `complete`
- Trace Explorer: `complete`
- Runtime QA: `complete`
- Resource Registry / Provider Profile: `complete`
- Outbound Link Manager: `complete`
- Backup Center: `complete`
- Indexing Deferred: `deferred`
- Blockers and Next Gates: `future_boundary_required`
