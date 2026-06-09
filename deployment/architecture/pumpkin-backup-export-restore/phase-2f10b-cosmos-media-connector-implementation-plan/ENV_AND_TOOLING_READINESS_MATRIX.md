# Environment And Tooling Readiness Matrix

All checks must be presence-only unless a later approval explicitly permits a read-only operation. Values must not be printed.

| Category | Name | Required For | Check Type | Notes |
| --- | --- | --- | --- | --- |
| Runtime | `node` | All connector CLI commands | Version presence | Existing backup implementation is Node-based. |
| Runtime | `npm` | Tests and package scripts | Version presence | Use existing package scripts where possible. |
| Azure CLI | `az` | Azure read-only discovery | Version/account presence | No mutation commands. |
| Azure CLI | Azure logged-in account | Azure read-only discovery | Account presence | Report only signed-in state and subscription display after redaction review. |
| Optional transfer | `azcopy` | Future blob copy/download | Version presence | Not needed for metadata-only planning. |
| Profile | `PUMPKIN_BACKUP_PROFILE` | All non-fixture commands | Env presence | Must be explicit. |
| Database provider | `PUMPKIN_DATABASE_PROVIDER` | Cosmos profile resolution | Env presence | Expected `cosmos` for Ice unless discovery proves otherwise. |
| Cosmos account | `PUMPKIN_COSMOS_ACCOUNT_NAME` | Cosmos discovery/export | Env presence | Non-secret identifier, still redact by default. |
| Cosmos resource group | `PUMPKIN_COSMOS_RESOURCE_GROUP` | Azure read-only discovery | Env presence | Non-secret identifier, still redact by default. |
| Cosmos database | `PUMPKIN_COSMOS_DATABASE_NAME` | Cosmos discovery/export | Env presence | Non-secret identifier, still redact by default. |
| Cosmos container hints | `PUMPKIN_COSMOS_CONTAINER_PREFIX` | Container selection | Env presence | Optional if discovery can enumerate safely. |
| Cosmos auth mode | `PUMPKIN_COSMOS_AUTH_MODE` | Auth boundary | Env presence | Should describe identity mode, not include credentials. |
| Tenant scope | `PUMPKIN_TENANT_ID` | Tenant-scoped export | Env presence | Required before real export. |
| Tenant scope | `PUMPKIN_TENANT_SLUG` | Reports and bundle paths | Env presence | Required for deterministic bundle path. |
| Site scope | `PUMPKIN_SITE_ID` | Tenant-scoped export | Env presence | Required before real export when site-level records exist. |
| Site scope | `PUMPKIN_SITE_SLUG` | Reports and bundle paths | Env presence | Required for deterministic bundle path. |
| Azure subscription | `AZURE_SUBSCRIPTION_ID` | Azure read-only discovery | Env presence | Do not print raw value. |
| Media provider | `PUMPKIN_MEDIA_PROVIDER` | Media profile resolution | Env presence | Expected `azure-blob` for Ice. |
| Media account | `PUMPKIN_MEDIA_STORAGE_ACCOUNT` | Media discovery/copy | Env presence | Expected source is `iceskatingmedia`. |
| Media container | `PUMPKIN_MEDIA_CONTAINER` | Media discovery/copy | Env presence | Expected source is `ice-rink-rentals-media`. |
| Media resource group | `PUMPKIN_MEDIA_RESOURCE_GROUP` | Azure read-only discovery | Env presence | Expected source is `rg-ice-production-media`. |
| Media public host | `PUMPKIN_MEDIA_PUBLIC_HOST` | Blob map building | Env presence | Expected host is `media.iceskatingrinkrentals.com`. |

## Readiness Classes

- `ready`: required tool/env presence confirmed and approval exists.
- `missing-tool`: a required CLI/runtime is unavailable.
- `missing-env`: a required env var is absent.
- `approval-needed`: tool/env exists but execution is outside current approval.
- `blocked`: connector cannot run safely.

## Current Phase 2F-10B Classification

- Connector implementation plan: ready for future approval.
- Real Cosmos export: approval-needed.
- Real media blob download/copy: approval-needed.
- Ice fully backupable today: no.
