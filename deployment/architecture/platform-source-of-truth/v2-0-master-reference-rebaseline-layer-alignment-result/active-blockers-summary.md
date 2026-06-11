# Active Blockers Summary

The following blockers carry forward into V2.

## OLM Staging Contract

- `OLM_STAGING_PROVIDER_PROFILE_ID`
- `OLM_STAGING_PROVIDER_TYPE`
- `OLM_STAGING_PROVIDER_MODE`
- `OLM_STAGING_RESOURCE_SCOPE`
- `OLM_STAGING_ACCOUNT_OR_HOST`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`
- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

## Closed Gates

- staging provider write
- first scoped staging write reattempt
- Azure resource creation
- Azure mutation
- RBAC assignment
- protected config read
- secret export
- CMS write
- production database migration
- production provider write
- deployment
- indexing
- live publication

## Immutable Current Facts

- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected records: `48`
- records written: `0`
- readback run: `false`

