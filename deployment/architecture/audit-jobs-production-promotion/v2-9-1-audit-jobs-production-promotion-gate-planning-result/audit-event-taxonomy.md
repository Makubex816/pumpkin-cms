# Audit Event Taxonomy

Result: complete.

Audit events are append-only control-layer records. They summarize what happened, what evidence supports it, which boundary approved it, and which safety gates remained closed.

| Event type | Purpose | Required evidence |
| --- | --- | --- |
| `production_static_release_deployed` | Records a production deployment result | Deployment report/package, deployment ID, artifact run/hash |
| `production_route_verification_passed` | Records bounded production route success | Route check summary, approved route list, method, timestamp |
| `production_route_verification_failed` | Records route check failure | Failed route list, status/error, no-retry/no-crawl boundary |
| `contact_form_live_submission_verified` | Records exactly one approved synthetic contact-form verification | Payload shape summary, POST count, response shape summary |
| `indexing_deferred_hard_stop` | Records Search Console/indexing deferral | Hard-stop approval text, no-action confirmation |
| `runtime_qa_passed` | Records Runtime QA pass | Runtime QA package/report, run ID if available |
| `resource_registry_validation_passed` | Records Resource Registry validation pass | Operational binding result, validation ID if available |
| `provider_profile_validation_passed` | Records provider profile validation pass | Provider profile status/matrix/result |
| `olm_publish_gate_passed` | Records OLM publish-gate readiness | OLM package/report/test summary |
| `backup_evidence_available` | Records backup evidence availability | Backup Center package/report, proof summary |
| `rollback_abort_plan_recorded` | Records rollback/abort owner and plan | Rollback plan ID/path, owner/operator record |
| `future_boundary_created` | Records a next gate rather than executing it | Next-phase prompt and blocked action list |

Every event must include:

- `auditEventId`
- `v2Reference`
- `laneId`
- `tenantKey`
- `siteKey`
- `eventType`
- `occurredAt`
- `evidenceRefs`
- `approvalReference`
- `correlationId`
- `outcome`
- `safetyBoundary`

Events must never store raw secrets, deployment tokens, OAuth tokens, auth headers, cookies, real customer/private data, connection strings, storage keys, SAS URLs, or raw protected config values.

