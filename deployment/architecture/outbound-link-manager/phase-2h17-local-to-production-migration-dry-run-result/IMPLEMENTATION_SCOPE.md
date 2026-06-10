# Implementation Scope

Implemented in `deployment/architecture/outbound-link-manager/local-scanner-registry-implementation`:

- migration dry-run CLI commands
- production candidate record mapper
- deterministic ID and state-hash helpers
- target entity router
- tenant/site partition validator
- schema contract validator
- migration manifest writer
- checksum writer and validator
- rollback package writer
- Resource Registry update candidate writer
- Backup Center pre-migration requirement writer
- validation report writer
- migration fixtures and negative fixtures
- migration dry-run test coverage
- operator docs

Out of scope and not performed:

- production DB migration
- live provider writes
- CMS writes
- protected config reads
- Azure/CMS/API mutations
- external crawling or live HTTP checks
- deployment, indexing, or live-page publication

