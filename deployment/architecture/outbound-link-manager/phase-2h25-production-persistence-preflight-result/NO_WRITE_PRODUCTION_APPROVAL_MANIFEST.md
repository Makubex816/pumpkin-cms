# No-write Production Approval Manifest

| Field | Value |
| --- | --- |
| productionApprovalManifestId | `olprodapprove_2h25_no_write_preflight` |
| approvalType | `production-persistence-preflight-no-write` |
| productionExecutionApprovalGranted | `false` |
| stagingApprovalManifestId | `olapprove_508df3f03faa4f80` |
| firstWriteBatchId | `olbatch_b08e184fdc6565aa` |
| expectedRecordCount | `48` |
| stagingReadbackCount | `48` |
| productionProviderProfileId | missing |
| productionProviderMode | missing |
| productionTargetName | missing |
| tenantKey | `fixture-tenant`, requires production approval |
| siteKey | `fixture-site`, requires production approval |
| backupCenterEvidenceRef | missing |
| resourceRegistryProductionBindingRef | missing |
| rollbackPlanId | `olprodrp_2h25_preflight_no_execution` |
| readbackPlanId | `olprodread_2h25_preflight` |
| auditTracePlanId | `olprodaudit_2h25_preflight` |
| noGoConditionResultId | `olprodnog_2h25_preflight` |
| operatorApprovalRef | `not-granted-phase-2h25-no-write` |
| futureExecutionBoundary | Phase 2H-26 |

This manifest explicitly does not grant production execution approval.
