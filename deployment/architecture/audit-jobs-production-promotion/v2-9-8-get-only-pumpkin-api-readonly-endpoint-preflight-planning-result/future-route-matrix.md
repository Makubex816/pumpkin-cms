# Future Route Matrix

Status: implementation-ready plan; no routes registered in V2.9.8.

| Method | Route | Response data DTO | Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/audit-jobs/viewer-summary` | `AuditJobViewerSummaryDto` | `tenantKey`, `siteKey` | Returns the complete summary plus counts, states, security boundary, warnings, blockers, next gates, and panel metadata. |
| GET | `/api/admin/audit-jobs/events` | `AuditEventListDto` | `tenantKey`, `siteKey`, `type`, `outcome`, `from`, `to`, `page`, `pageSize`, `sort`, `sortDirection` | Lists audit events from the shared viewer model. |
| GET | `/api/admin/audit-jobs/job-runs` | `JobRunListDto` | `tenantKey`, `siteKey`, `type`, `status`, `outcome`, `page`, `pageSize`, `sort`, `sortDirection` | Lists job runs and evidence refs. |
| GET | `/api/admin/audit-jobs/promotion-gates` | `PromotionGateListDto` | `tenantKey`, `siteKey`, `type`, `state`, `result`, `page`, `pageSize`, `sort`, `sortDirection` | Lists promotion gates and missing evidence refs. |
| GET | `/api/admin/audit-jobs/evidence-bindings` | `EvidenceBindingListDto` | `tenantKey`, `siteKey`, `type`, `sourceRef`, `page`, `pageSize`, `sort`, `sortDirection` | Lists safe evidence metadata only. |
| GET | `/api/admin/audit-jobs/traces` | `TraceEntryListDto` | `tenantKey`, `siteKey`, `field`, `auditEventId`, `correlationId`, `search`, `page`, `pageSize` | Lists trace entries for support/debug navigation. |
| GET | `/api/admin/audit-jobs/blockers` | `AuditJobBlockerListDto` | `tenantKey`, `siteKey` | Returns current blockers; expected empty for the V2.8/V2.9 combined fixture. |
| GET | `/api/admin/audit-jobs/next-gates` | `AuditJobNextGateListDto` | `tenantKey`, `siteKey` | Returns future-gated next actions, including Google indexing deferred. |

All routes must return the read-only API envelope with `readOnly: true`, explicit `providerMode`, `requestId`, `correlationId`, `tenantKey`, `siteKey`, `warnings`, `errors`, `securityBoundary`, `source`, and `meta`.

All write methods are disallowed for this route family.

