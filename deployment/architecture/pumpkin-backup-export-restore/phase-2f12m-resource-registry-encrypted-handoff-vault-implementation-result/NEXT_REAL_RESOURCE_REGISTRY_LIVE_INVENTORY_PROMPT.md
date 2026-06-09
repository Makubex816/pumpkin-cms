# Next Real Resource Registry Live Inventory Prompt

Approve Phase 2F-12N Real Resource Registry Live Inventory Read-Only Reconciliation.

Allowed:

- read only approved non-secret live resource metadata
- compare live metadata to the Phase 2F-12M redacted registry fixture
- produce a redacted registry candidate and gap report

Not allowed:

- protected config reads
- secret/key/token export
- CMS/API writes
- Azure mutations
- deployments
- Search Console/indexing
- live-page publication

Outputs:

- live read-only inventory report
- redacted registry diff
- credential reference gap report
- readiness classification
- next prompt
