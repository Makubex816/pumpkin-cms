# Environment And Tooling Presence Result

Values were not printed or recorded.

## Tooling

| Check | Presence |
| --- | --- |
| Azure CLI | PRESENT |
| Azure CLI logged in | PRESENT |
| Node.js | PRESENT |
| npm | PRESENT |

## CMS And Tenant Env

| Env Name | Presence |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |
| `ICE_RINK_RENTALS_TENANT_ID` | MISSING |
| `ICE_RINK_RENTALS_API_KEY` | MISSING |

## Cosmos Env

| Env Name | Presence |
| --- | --- |
| `PUMPKIN_DATABASE_PROVIDER` | MISSING |
| `PUMPKIN_COSMOS_ACCOUNT_NAME` | MISSING |
| `PUMPKIN_COSMOS_RESOURCE_GROUP` | MISSING |
| `PUMPKIN_COSMOS_DATABASE_NAME` | MISSING |
| `PUMPKIN_COSMOS_CONTAINER_PREFIX` | MISSING |
| `PUMPKIN_COSMOS_AUTH_MODE` | MISSING |
| `PUMPKIN_TENANT_ID` | MISSING |
| `PUMPKIN_TENANT_SLUG` | MISSING |
| `PUMPKIN_SITE_ID` | MISSING |
| `PUMPKIN_SITE_SLUG` | MISSING |

## Azure And Media Env

| Env Name | Presence |
| --- | --- |
| `AZURE_SUBSCRIPTION_ID` | MISSING |
| `AZURE_RESOURCE_GROUP` | MISSING |
| `PUMPKIN_MEDIA_PROVIDER` | MISSING |
| `PUMPKIN_MEDIA_STORAGE_ACCOUNT` | MISSING |
| `PUMPKIN_MEDIA_CONTAINER` | MISSING |
| `PUMPKIN_MEDIA_RESOURCE_GROUP` | MISSING |
| `PUMPKIN_MEDIA_PUBLIC_HOST` | MISSING |
| `ICE_MEDIA_STORAGE_ACCOUNT` | MISSING |
| `ICE_MEDIA_CONTAINER` | MISSING |
| `ICE_MEDIA_PUBLIC_HOST` | MISSING |
| `ICE_MEDIA_BACKUP_OUTPUT_DIR` | MISSING |
| `ICE_MEDIA_COPY_MODE` | MISSING |
| `AZURE_BACKUP_STORAGE_ACCOUNT` | MISSING |
| `AZURE_BACKUP_CONTAINER` | MISSING |

## Readiness Impact

Local fake connector regression can run. Live Cosmos execution is blocked by missing provider/account/tenant-scope env hints and by the absence of visible Cosmos accounts in the active Azure subscription. Media metadata preflight can run because Azure RBAC/login access was sufficient for storage/container/blob metadata.
