# Endpoint To Panel Mapping

| Endpoint | Admin panels fed | Notes |
| --- | --- | --- |
| `/api/admin/audit-jobs/viewer-summary` | Release Summary, all panel counts, global read-only banner, warnings, blockers, next gates | First request in API mode. Drives summary strip, panel grid, provider metadata, and degraded/fallback flags. |
| `/api/admin/audit-jobs/events` | Audit Events, Runtime QA, Resource Registry / Provider Profile, Outbound Link Manager, Backup Center, Indexing Deferred | Event rows create `audit_event` records and support operational coverage panels. |
| `/api/admin/audit-jobs/job-runs` | Job Runs | Job rows create `job_run` records and provide job evidence summaries. |
| `/api/admin/audit-jobs/promotion-gates` | Promotion Gates, Blockers and Next Gates | Gate rows create `promotion_gate` records and gate states. |
| `/api/admin/audit-jobs/evidence-bindings` | Evidence Bindings | Evidence rows create `evidence_binding` records and safe evidence references. |
| `/api/admin/audit-jobs/traces` | Trace Explorer | Trace rows create `trace_id` records and correlation navigation. |
| `/api/admin/audit-jobs/blockers` | Blockers and Next Gates | Populates blockers area. Expected count is `0` for the current fixture-backed API. |
| `/api/admin/audit-jobs/next-gates` | Blockers and Next Gates, disabled future actions context | Populates next-gate area. Must include Google indexing deferred. |

V2.9.11 should prefer a single route-orchestration provider that calls the summary route first, then loads the list routes required for record tables and detail views. It should not add a write route or mutation action.

