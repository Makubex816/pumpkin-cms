# Cross-Layer Trace ID Registry

Result: complete.

Trace IDs connect V2 references, approvals, artifacts, deployments, validations, route checks, contact-form checks, and future promotion gates.

| Field | Required for | Description |
| --- | --- | --- |
| `v2Reference` | all records | Current V2 reference, for example `V2.9.1` |
| `laneId` | all records | Product lane such as `audit-jobs-production-promotion` |
| `tenantKey` | tenant/site records | Tenant key such as `ice-rink-rentals` |
| `siteKey` | tenant/site records | Site key, usually same as tenant key for Ice |
| `jobRunId` | job records | Stable ID for one job/run record |
| `auditEventId` | audit events | Stable ID for one audit event |
| `correlationId` | related records | Links job, event, approval, and evidence |
| `approvalReference` | approved or blocked boundaries | Approval prompt/reference identifier |
| `artifactRunId` | build/deploy evidence | Static artifact run ID |
| `artifactHash` | build/deploy evidence | Aggregate artifact SHA-256 |
| `deploymentId` | deployment evidence | Provider deployment ID |
| `routeCheckId` | route checks | Stable ID for bounded route verification |
| `runtimeQaRunId` | Runtime QA | Runtime QA evidence run ID if available |
| `resourceRegistryValidationId` | Resource Registry | Validation run or package ID |
| `providerProfileValidationId` | Provider Profile | Provider profile validation run or matrix ID |
| `olmValidationId` | OLM | OLM validation package/run ID |
| `rollbackPlanId` | rollback/abort plans | Rollback/abort plan or checklist ID |
| `boundaryGateId` | future gates | Gate ID for a future explicit boundary |
| `outcome` | all records | Final state such as `passed`, `blocked`, or `deferred` |

Minimum trace profile for V2.8 carryforward:

```text
v2Reference=V2.8.19
laneId=tenant-website-publish-readiness
tenantKey=ice-rink-rentals
siteKey=ice-rink-rentals
artifactRunId=sanitized_20260613174033
artifactHash=506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899
deploymentId=96fd744f-5589-4ac3-bebb-cfa99048dc0e
outcome=contact_form_verified_indexing_deferred_v2_8_complete
```

