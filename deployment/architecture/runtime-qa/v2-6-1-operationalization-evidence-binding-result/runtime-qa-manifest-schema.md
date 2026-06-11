# Runtime QA Manifest Schema

The registry fixture defines:

- `schemaVersion`
- `registryId`
- `phase`
- `environmentMode`
- `providerProfileId`
- `layerRefs`
- `checkedRoutes`
- `checkedApis`
- `requiredCheckIds`
- `providerModes`
- `sourceEvidenceRefs`
- `checks`
- `securityBoundarySummary`

Each check can define source evidence references, file marker checks, JSON assertions, provider mode assertions, source scans, self-generated manifest validation, or local/offline preservation checks.

Required V2.6.1 check IDs are:

- `admin-outbound-links-route`
- `admin-provider-readiness-messaging`
- `admin-future-gated-actions`
- `api-olm-readonly`
- `api-olm-write-action-guard`
- `provider-profile-validation`
- `resource-registry-operational-bindings`
- `olm-staging-contract`
- `staging-cosmos-readonly-sanity`
- `backup-center-staging-proof`
- `runtime-qa-evidence-manifest`
- `no-uncontrolled-write-scan`
- `local-offline-preservation`
