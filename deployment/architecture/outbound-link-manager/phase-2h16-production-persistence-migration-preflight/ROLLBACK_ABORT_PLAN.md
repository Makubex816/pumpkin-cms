# Rollback And Abort Plan

Abort before migration if:

- backup proof is missing
- Resource Registry target is incomplete
- tenant/site isolation fails
- schema validation fails
- dry-run diff is not approved
- runtime browser QA fails
- staging rehearsal fails
- owner signoff is missing
- provider mode is not explicit

Rollback requirements:

- rollback plan generated before migration
- before/after hashes for every write batch
- affected entity IDs listed
- readback plan for restored state
- operator instructions
- owner contact
- Backup Center restore reference
- no executable live rollback until separately approved

Write execution must stop on conflicts, missing records, duplicate IDs, partition mismatch, or unexpected provider response.
