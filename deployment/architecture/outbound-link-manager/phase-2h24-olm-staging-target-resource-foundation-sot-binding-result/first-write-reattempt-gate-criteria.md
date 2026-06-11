# First-Write Reattempt Gate Criteria

Every gate must pass before a future first scoped staging write reattempt.

| Gate | Required state |
| --- | --- |
| Approval manifest | equals `olapprove_508df3f03faa4f80` |
| First-write batch | equals `olbatch_b08e184fdc6565aa` |
| Expected records | equals `48`, or variance explicitly approved |
| `OLM_STAGING_*` contract | all fields present, non-placeholder, non-blocked |
| Provider profile | real scoped staging write profile |
| Provider mode | not `staging-simulated`; not `production-runtime` |
| Resource Registry | mapping exists without secrets |
| Backup Center | target-specific pre-write evidence identified and approved |
| Runtime QA | pre-write evidence identified and passed |
| Readback | concrete method approved |
| Rollback | concrete method approved and tied to first-write batch |
| RBAC/session | safe mode/type identified without protected config reads |
| No-go conditions | all false |
| Staged files | none required for generated `.tmp` artifacts |

Failure of any gate must stop before write.

