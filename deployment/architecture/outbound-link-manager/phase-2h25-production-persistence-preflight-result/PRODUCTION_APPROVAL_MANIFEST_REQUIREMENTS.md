# Production Approval Manifest Requirements

Required fields for a future production execution approval:

- productionApprovalManifestId
- approvalType
- productionExecutionApprovalGranted
- stagingApprovalManifestId
- firstWriteBatchId
- expectedRecordCount
- stagingReadbackCount
- productionProviderProfileId
- productionProviderMode
- productionTargetName
- tenantKey
- siteKey
- backupCenterEvidenceRef
- resourceRegistryProductionBindingRef
- rollbackPlanId
- readbackPlanId
- auditTracePlanId
- noGoConditionResultId
- operatorApprovalRef
- futureExecutionBoundary

Phase 2H-25 creates a no-write manifest with execution approval false. Phase 2H-26 must create or update a separate execution manifest only if the user explicitly approves production migration.
