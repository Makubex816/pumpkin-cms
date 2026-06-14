# Audit Event Schema

V2.9.2 source of truth: `src/audit-job-ledger-schema.mjs`.

Required fields:

- `auditEventId`
- `eventType`
- `v2Reference`
- `laneId`
- `tenantKey`
- `siteKey`
- `occurredAt`
- `outcome`
- `evidenceRefs`
- `traceIds`
- `actor`
- `boundaryClass`
- `mutationClass`
- `securityBoundary`

Supported event types:

- `production_static_release_deployed`
- `production_route_verification_passed`
- `production_route_verification_failed`
- `contact_form_live_submission_verified`
- `contact_form_live_submission_failed`
- `indexing_deferred_hard_stop`
- `runtime_qa_passed`
- `resource_registry_validation_passed`
- `provider_profile_validation_passed`
- `olm_publish_gate_passed`
- `backup_evidence_available`
- `rollback_abort_plan_recorded`
- `future_boundary_created`

Audit events must reference safe evidence binding IDs and must not store raw secrets, raw contact payload values, full private response IDs, protected config values, tokens, keys, connection strings, SAS values, or private data.
