# API GET Runtime Verification Result

Status: passed.

Runtime model:

- Local Pumpkin API was started on localhost with safe local-only settings.
- Protected config was not read.
- A bounded synthetic local auth context was used for the localhost GET checks and was not printed.
- All processes started for this verification were stopped.

Verified route family:

- Base path: `/api/admin/audit-jobs`
- Provider mode: `api-local-fixture-readonly`
- Security boundary: `localOnly: true`, `noWriteBoundarySatisfied: true`, open flags `0`

| Route | HTTP | Expected data | Result |
| --- | --- | --- | --- |
| `/api/admin/audit-jobs/viewer-summary` | 200 | `readOnly: true`, item count 11, indexing `deferred_hard_stop` | Passed |
| `/api/admin/audit-jobs/events` | 200 | 11 events | Passed |
| `/api/admin/audit-jobs/job-runs` | 200 | 9 job runs | Passed |
| `/api/admin/audit-jobs/promotion-gates` | 200 | 11 promotion gates | Passed |
| `/api/admin/audit-jobs/evidence-bindings` | 200 | 13 evidence bindings | Passed |
| `/api/admin/audit-jobs/traces` | 200 | 107 traces | Passed |
| `/api/admin/audit-jobs/blockers` | 200 | 0 blockers | Passed |
| `/api/admin/audit-jobs/next-gates` | 200 | 2 next gates | Passed |

No POST, PUT, PATCH, or DELETE requests were sent.
