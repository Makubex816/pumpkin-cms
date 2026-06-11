# Blockers And Open Decisions

## Remaining Blockers

| Blocker | Required resolution |
| --- | --- |
| RBAC assignment missing | Approve explicit principal, role, and staging-limited scope. |
| Provider profile not active | Register repo-supported provider profile using non-secret V2.3.3 outputs. |
| Provider mode future-gated | Approve first-write mode only in the future scoped OLM write phase. |
| Data-plane readback not validated | Validate Entra/RBAC readback without keys after RBAC is assigned. |
| Rollback execution not validated | Bind and validate batch rollback plan after RBAC is assigned. |
| OLM first write not approved | Separate approval required for `olbatch_b08e184fdc6565aa`. |

## Open Decisions

- Which identity receives Cosmos data-plane RBAC: managed identity, operator session, or both.
- Whether Backup Center and Runtime QA storage containers need write RBAC before first OLM write.
- Whether public network access on Cosmos should be narrowed in a later hardening phase.
- Whether budget/cost alert should be created in a follow-up pass.

