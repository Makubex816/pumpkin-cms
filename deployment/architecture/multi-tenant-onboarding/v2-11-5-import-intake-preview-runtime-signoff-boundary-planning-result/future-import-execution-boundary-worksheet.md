# Future Import Execution Boundary Worksheet

Status: created. This is a required input for a future preflight only; it is not approval to execute an import.

Required fields:

| Field | Requirement |
| --- | --- |
| `approvalManifestId` | Unique approval manifest ID, immutable after signoff. |
| `approvedPackageId` | Exact package ID from the no-write builder output. |
| `tenantKey` | Exact target tenant key. |
| `siteKey` | Exact target site key. |
| `packageHash` | SHA-256 or equivalent immutable package digest. |
| `ownerApproval` | Named owner approval with timestamp and scope. |
| `operatorApproval` | Named operator approval with timestamp and scope. |
| `BackupCenterPreExecutionEvidence` | Backup evidence ref and restore/readback proof requirement. |
| `ResourceRegistryBinding` | Target/source resource binding and expected provider ownership. |
| `ProviderProfileBinding` | Provider profile ID and no-live-write boundary review. |
| `RuntimeQaPreExecutionEvidence` | Runtime QA refs required before any execution. |
| `RollbackPlanId` | Exact rollback or abort plan. |
| `ReadbackPlanId` | Exact readback plan for post-write verification. |
| `AuditJobTraceId` | Trace ID to bind execution, readback, rollback, and no-go decisions. |
| `NoGoConditionResult` | All no-go checks must be `cleared`; any warning requires named override. |
| `ImportMode` | Must be explicit, e.g. `no_write_dry_run`, `scoped_import_execution`, or `paused_no_import`. |
| `ExecutionBoundary` | Exact allowed commands/actions; all unspecified actions remain closed. |

Target/source readiness gates:

- Source package digest matches the approval manifest.
- Target tenant/site binding is unambiguous.
- Target tenant lifecycle allows the requested mode.
- Roller remains blocked unless resume is separately approved.
- Backup, Registry, Profile, Runtime QA, rollback, readback, and audit trace refs are present.
- No indexing/contact/deploy/provider/CMS/Azure side effect is bundled into import execution.

