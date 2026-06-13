# Job Run Taxonomy

Result: complete.

Job runs are local control-layer records for validations, planned operations, and explicitly approved one-action boundaries.

| Job type | Purpose | Write/live boundary |
| --- | --- | --- |
| `static_build_validation` | Records static build or sanitized build validation | Local only unless future deployment approval exists |
| `static_output_validation` | Records static output validator result | Local only |
| `staging_package_validation` | Records staging package validator result | Local only |
| `runtime_qa` | Records Runtime QA harness checks | Local/read-only only |
| `resource_registry_validation` | Records Resource Registry operational binding validation | Local/read-only only |
| `provider_profile_validation` | Records provider profile validation | Local/read-only only |
| `olm_publish_gate_validation` | Records OLM publish-gate checks | Local/offline unless separately approved |
| `production_deployment_attempt` | Records a deployment attempt | Requires explicit deployment approval |
| `production_route_check` | Records bounded approved route checks | GET-only, approved URL list only |
| `contact_form_live_verification` | Records exactly one approved synthetic contact-form POST | Requires explicit one-action approval |
| `indexing_deferred_record` | Records indexing hard-stop deferral | No Google action |
| `rollback_abort_plan_review` | Records plan review and owner closure | No destructive rollback execution |

Required job fields:

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
- `evidenceRefs`
- `approvalReference`
- `correlationId`
- `attemptCount`
- `retryCount`
- `mutationFlags`
- `safetyBoundary`

Job records must distinguish:

- `planned`
- `approved_for_one_action`
- `running`
- `passed`
- `failed`
- `blocked`
- `deferred`
- `superseded`

