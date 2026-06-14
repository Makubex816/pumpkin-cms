# Trace ID Requirements

V2.9.2 source of truth: `src/audit-job-ledger-schema.mjs`.

Common trace fields for audit events:

- `v2Reference`
- `laneId`
- `tenantKey`
- `siteKey`
- `auditEventId`
- `correlationId`
- `approvalReference`
- `outcome`

Event-specific trace fields:

| Event type | Additional trace fields |
| --- | --- |
| `production_static_release_deployed` | `jobRunId`, `artifactRunId`, `artifactHash`, `deploymentId` |
| `production_route_verification_passed` | `jobRunId`, `routeCheckId` |
| `production_route_verification_failed` | `jobRunId`, `routeCheckId` |
| `contact_form_live_submission_verified` | `jobRunId`, `boundaryGateId` |
| `contact_form_live_submission_failed` | `jobRunId`, `boundaryGateId` |
| `indexing_deferred_hard_stop` | `boundaryGateId` |
| `runtime_qa_passed` | `jobRunId`, `runtimeQaRunId` |
| `resource_registry_validation_passed` | `jobRunId`, `resourceRegistryValidationId` |
| `provider_profile_validation_passed` | `jobRunId`, `providerProfileValidationId` |
| `olm_publish_gate_passed` | `jobRunId`, `olmValidationId` |
| `backup_evidence_available` | common trace fields only |
| `rollback_abort_plan_recorded` | `rollbackPlanId` |
| `future_boundary_created` | `boundaryGateId` |

Trace fields that duplicate event fields must match their parent audit event record.
