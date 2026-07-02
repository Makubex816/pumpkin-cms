# Pumpkin Updated Build Priority Map V2.8.54F

| priority | item | reason |
| --- | --- | --- |
| P0 | Keep live production/observability resources intact | Ice tenant, Pumpkin API/Admin, Cosmos, media, SWA, alerts are currently green and bound. |
| P1 | Resolve V2.8.54D worktree owner decisions | Partner live creation remains blocked by unresolved repo state. |
| P1 | Prepare exact dependency-proof cleanup audit for rg-pumpkincms-stg-eastus-olm | Looks redundant/nonproduction, but tagged manual-review-required and needs dependency proof before delete. |
| P2 | Legacy static form endpoint decommission proof | V2.8.46A deferred it; keep until traffic/source/config/storage dependency proof is complete. |
| P2 | Partner package read-only review | Can proceed only without mutation while repo/live creation remains gated. |
| P3 | Partner tenant creation preflight | Only after cleanup decisions, worktree state, tenant package, and live mutation approval are closed. |

