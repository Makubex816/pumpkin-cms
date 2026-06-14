# Job Run Schema

V2.9.2 source of truth: `src/audit-job-ledger-schema.mjs`.

Required fields:

- `jobRunId`
- `jobType`
- `v2Reference`
- `laneId`
- `tenantKey`
- `siteKey`
- `startedAt`
- `completedAt`
- `status`
- `outcome`
- `inputRefs`
- `outputRefs`
- `validationRefs`
- `auditEventIds`
- `securityBoundary`

Supported job types:

- `static_build_validation`
- `static_output_validation`
- `staging_package_validation`
- `runtime_qa`
- `resource_registry_validation`
- `provider_profile_validation`
- `olm_publish_gate_validation`
- `production_deployment_attempt`
- `production_route_check`
- `contact_form_live_verification`
- `indexing_deferred_record`
- `rollback_abort_plan_review`

Supported statuses:

- `planned`
- `approved_for_one_action`
- `running`
- `passed`
- `failed`
- `blocked`
- `deferred`
- `superseded`
- `cancelled`

Job runs are local records in this implementation. Historical V2.8 live/write actions are represented by safe evidence summaries; the V2.9.2 validator does not execute those actions.
