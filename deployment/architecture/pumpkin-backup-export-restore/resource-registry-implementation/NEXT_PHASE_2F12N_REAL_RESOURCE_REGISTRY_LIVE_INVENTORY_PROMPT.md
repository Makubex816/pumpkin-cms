# Next Phase 2F-12N Prompt

Approve Phase 2F-12N Real Resource Registry Live Inventory Read-Only Reconciliation.

Scope:

- Read only non-secret resource metadata already approved for inventory.
- Compare live metadata against the Phase 2F-12M redacted fixture.
- Produce an updated redacted resource registry candidate.
- Do not read protected config.
- Do not request or print keys, tokens, connection strings, cookies, auth headers, private keys, or SAS values.
- Do not run CMS writes, deployments, Search Console/indexing, or live-page publication.
- Keep any generated output under ignored `.tmp/` unless explicitly approved for a committable redacted report.

Required outputs:

- live read-only inventory report
- redacted registry diff
- credential reference gap report
- readiness classification for Backup Center wiring
- updated next-step prompt
