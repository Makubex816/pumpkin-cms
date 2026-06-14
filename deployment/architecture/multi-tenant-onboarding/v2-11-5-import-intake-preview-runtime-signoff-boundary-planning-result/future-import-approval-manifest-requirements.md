# Future Import Approval Manifest Requirements

Status: created.

A future import execution phase must provide a signed approval manifest before any write-capable code path, endpoint, CLI command, or Admin action can be enabled.

Minimum manifest shape:

- `schemaVersion`
- `approvalManifestId`
- `phaseApprovalId`
- `approvedPackageId`
- `tenantKey`
- `siteKey`
- `packageHash`
- `sourcePackagePath`
- `targetEnvironment`
- `importMode`
- `ownerApproval`
- `operatorApproval`
- `BackupCenterPreExecutionEvidence`
- `ResourceRegistryBinding`
- `ProviderProfileBinding`
- `RuntimeQaPreExecutionEvidence`
- `RollbackPlanId`
- `ReadbackPlanId`
- `AuditJobTraceId`
- `NoGoConditionResult`
- `ExecutionBoundary`
- `forbiddenActions`
- `approvalExpiresAt`

Approval rules:

- Owner and operator approvals must be named and scoped.
- Approval must distinguish no-write dry-run, preflight, and write execution.
- Approval must not imply deployment, DNS, indexing, contact POST, Azure mutation, CMS/provider writes beyond the exact import scope, Roller resume, or tenant creation unless each is separately and explicitly named.
- Manifest must be stored as a redacted repo-safe artifact or supplied through a safe approved channel; it must not include secret values.

