# Query Filter Search Sort Mapping

Admin current query state:

- `search`;
- `kind`;
- `state`;
- `sortField`;
- `sortDirection`.

API mapping:

| Admin concern | API route/query |
| --- | --- |
| global search | `search` on `/events`, `/job-runs`, `/promotion-gates`, `/evidence-bindings`, `/traces`; local record search remains final merge filter. |
| `kind = audit_event` | call `/events`; optional `eventType`, `outcome`; normalize to `audit_event` records. |
| `kind = job_run` | call `/job-runs`; optional `jobType`, `status`, `outcome`; normalize to `job_run` records. |
| `kind = promotion_gate` | call `/promotion-gates`; optional `gateType`, `state`, `result`; normalize to `promotion_gate` records. |
| `kind = evidence_binding` | call `/evidence-bindings`; optional `type`, `sourceRef`; normalize to `evidence_binding` records. |
| `kind = trace_id` | call `/traces`; optional `field`, `auditEventId`, `correlationId`, `search`; normalize to `trace_id` records. |
| `state` | prefer API route state/result/status filters where exact, otherwise filter normalized records locally. |
| `sortField`, `sortDirection` | keep Admin local sorting until the API exposes explicit sort fields. |
| pagination | use API `page` and `pageSize`; default `250`, max `250`; Admin may keep local merged pagination until required. |

V2.9.11 should not add new API query parameters. Missing sort support is not a blocker because current Admin sorting is local and read-only.

