# Import Package Manifest Schema

Schema file:

`deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/schemas/import-package-manifest.schema.json`

Schema version:

`pumpkin.multiTenantImportPackage.v1`

Required fields:

- `schemaVersion`
- `packageId`
- `packageType`
- `tenantKey`
- `siteKey`
- `domain`
- `sourceSystem`
- `createdAt`
- `createdBy`
- `ownerApproval`
- `tenantLifecycleState`
- `routes`
- `contentRefs`
- `mediaRefs`
- `resourceRegistryRefs`
- `providerProfileRefs`
- `backupEvidenceRefs`
- `runtimeQaRefs`
- `outboundLinkRefs`
- `auditJobRefs`
- `securityBoundary`
- `redactionPolicy`
- `importMode`
- `rollbackPlanId`
- `validationRefs`

Validator enforcement:

- required fields must exist;
- package type and lifecycle state must be recognized;
- owner approval must be explicit;
- Backup Center, Resource Registry, Provider Profile, and Runtime QA references must exist;
- all blocked security flags must be false;
- secrets and protected config references are rejected;
- paused Roller resume without approval is rejected.
