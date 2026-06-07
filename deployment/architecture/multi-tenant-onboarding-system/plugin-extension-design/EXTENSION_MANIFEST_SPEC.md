# Extension Manifest Spec

Required manifest fields:

- `schemaVersion`
- `extensionId`
- `displayName`
- `version`
- `compatiblePumpkinVersions`
- `tenantScope`
- `permissions`
- `routesAdded`
- `cmsFieldsAdded`
- `apiEndpointsAdded`
- `frontendComponentsAdded`
- `migrations`
- `requiredEnvVars`
- `tests`
- `rollback`
- `securityReview`

Required env vars may be named, but values are runtime-only and must not be stored in extension manifests.

