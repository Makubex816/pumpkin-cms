# Live Write Approval Prerequisites

Live production writes are not approved.

Prerequisites for a future live-write-approved phase:

- explicit user prompt approving live writes
- production provider profile selected and validated
- production database migration approved separately
- Backup Center backup proof immediately before writes
- Resource Registry current and non-secret
- staging rehearsal passed
- runtime browser QA passed
- tenant/site isolation proof
- dry-run diff reviewed
- rollback plan with tested readback
- conflict/stop rules documented
- owner signoff
- post-write readback plan
- audit destination validation

If any prerequisite is missing, live-write-approved must return a blocked outcome.
