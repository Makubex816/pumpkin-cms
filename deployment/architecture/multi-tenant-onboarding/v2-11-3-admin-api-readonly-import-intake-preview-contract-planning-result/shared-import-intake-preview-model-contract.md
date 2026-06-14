# Shared Import Intake Preview Model Contract

Schema version:

`pumpkin.importIntakePreview.sharedModel.v1`

Required fields:

- `schemaVersion`
- `providerMode`
- `readOnly`
- `packageId`
- `packageType`
- `tenantKey`
- `siteKey`
- `domain`
- `tenantLifecycleState`
- `importMode`
- `readyForFutureImportExecution`
- `routes`
- `contentRefs`
- `mediaRefs`
- `formConfigRefs`
- `resourceRegistryRefs`
- `providerProfileRefs`
- `backupEvidenceRefs`
- `runtimeQaRefs`
- `outboundLinkRefs`
- `auditJobRefs`
- `noGoConditions`
- `rollbackPlanId`
- `validationRefs`
- `warnings`
- `blockers`
- `nextGates`
- `securityBoundary`
- `redactionPolicy`
- `generatedAt`

Admin and API must use this shared model so fixture fallback, API mode, and future Electron read-only preview can remain contract-compatible.
