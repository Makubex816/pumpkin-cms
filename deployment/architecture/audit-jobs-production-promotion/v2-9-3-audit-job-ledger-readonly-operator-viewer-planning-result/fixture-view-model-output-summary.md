# Fixture View Model Output Summary

Fixture:

`fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`

## Summary

- Reference: `V2.8.19`
- Lane: `tenant-website-publish-readiness`
- Tenant key: `ice-rink-rentals`
- Site key: `ice-rink-rentals`
- Status: `read_only`
- Release state: `complete`
- Indexing state: `deferred`
- Boundary state: `read_only`

## Counts

- Audit events: 11
- Job runs: 9
- Promotion gates: 11
- Evidence bindings: 13
- Trace entries: 107
- Warnings: 1
- Blockers: 0
- Next gates: 2

## Health

The only warning is `INDEXING_DEFERRED`. The model preserves the future-boundary next gate and does not convert deferred indexing into a runtime action.
