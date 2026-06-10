# Write Action Guards

Phase 2H-12 adds a local/offline write-action guard layer for sandbox simulation only.

The guard requires:

- known action type
- tenant and site matching the local store
- reason text
- allowed actor role
- assigned tenant/site scope for non-SuperAdmin actors
- approval reference for bulk actions
- `productionWriteApproved: false`
- `liveWriteApproved: false`

Approved requests mutate only a cloned sandbox store under `.tmp/<action-output>/sandbox-store`. Blocked requests write `ACTION_RESULT.json`, `PUBLISHING_IMPACT.json`, and `ROLLBACK_PLAN.json` without writing a sandbox store.

The existing API write guard service remains blocked and returns `OUTBOUND_LINK_WRITE_NOT_APPROVED`. Phase 2H-12 does not create production POST, PUT, PATCH, or DELETE routes.
