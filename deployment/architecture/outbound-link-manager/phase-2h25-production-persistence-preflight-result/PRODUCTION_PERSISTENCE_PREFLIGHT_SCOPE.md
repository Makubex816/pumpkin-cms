# Production Persistence Preflight Scope

Approved in this phase:

- prepare the production migration approval packet
- create target/profile/approval worksheets
- run local no-write migration dry-run validation
- identify exact missing production values
- define readback, rollback, audit, Backup Center, and Resource Registry prerequisites
- create the next execution-boundary prompt

Not approved:

- production database migration
- production provider write
- additional OLM staging write
- broad migration execution
- CMS write
- protected config read
- keys/listKeys
- connection string or SAS generation
- secret export
- deployment, indexing, external crawling, or live publication
