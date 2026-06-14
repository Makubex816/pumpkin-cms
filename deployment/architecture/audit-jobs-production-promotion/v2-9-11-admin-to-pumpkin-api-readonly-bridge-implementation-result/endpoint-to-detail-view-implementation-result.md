# Endpoint To Detail View Implementation Result

API endpoint records normalize to the existing Admin record kinds:

| Endpoint | Record kind |
| --- | --- |
| `/events` | `audit_event` |
| `/job-runs` | `job_run` |
| `/promotion-gates` | `promotion_gate` |
| `/evidence-bindings` | `evidence_binding` |
| `/traces` | `trace_id` |

The existing `queryAuditJobLedgerRecords`, `getAuditJobLedgerRecordById`, and detail panel behavior are reused.

The detail panel now describes whether it is reading from API mode, fixture fallback, or the original local fixture provider.
