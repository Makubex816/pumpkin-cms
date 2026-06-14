# Tenant Bundle Manifest Schema

Schema file:

`deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/schemas/tenant-bundle-manifest.schema.json`

Schema version:

`pumpkin.tenantBundleManifest.v1`

Required fields:

- `schemaVersion`
- `tenantKey`
- `siteKey`
- `domain`
- `bundleRefs`
- `ownerApproval`
- `securityBoundary`
- `rollbackPlanId`

Purpose:

The tenant bundle manifest is the top-level package index for future onboarding/import work. It must reference child packages instead of embedding raw protected material.

Boundary:

Tenant bundle validation does not create tenants, import CMS data, upload media, deploy, change DNS, submit contact forms, or request indexing.
