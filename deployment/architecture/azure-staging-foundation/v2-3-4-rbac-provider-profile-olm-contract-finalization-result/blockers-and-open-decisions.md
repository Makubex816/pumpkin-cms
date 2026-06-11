# Blockers And Open Decisions

## Remaining Blockers Before OLM First Write

| Blocker | Required resolution |
| --- | --- |
| Explicit first-write approval | Approve the scoped OLM staging write batch `olbatch_b08e184fdc6565aa`. |
| Package linkage refresh | Revalidate approval manifest, first-write package, expected record count, and provider profile ID. |
| Backup evidence refresh | Confirm Backup Center pre-write evidence remains current. |
| Runtime QA evidence refresh | Confirm no uncontrolled write calls and provider mode messaging remain correct. |
| Provider profile activation | Use `olm-staging-cosmos-nosql-v1` only for the approved first-write phase, not globally. |
| RBAC propagation | Confirm Cosmos data-plane RBAC is effective before writing records. |

## Open Decisions

- Whether to assign Storage Blob RBAC before uploading staging evidence.
- Whether to tighten Cosmos public network access after first-write proof.
- Whether to create budget/cost alerts for the staging resource group.

