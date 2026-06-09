# Env And Tooling Result

Date: 2026-06-09

Presence-only checks were run in the same terminal/session. Values were not printed, logged, or written.

## Core Ice Backup Env

| Name | Result |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |
| `ICE_RINK_RENTALS_API_KEY` | MISSING |
| `ICE_RINK_RENTALS_TENANT_ID` | MISSING |

The CMS read-only admin export path used `PUMPKIN_API_URL` and `PUMPKIN_ADMIN_JWT`. The Ice API key and tenant ID were not used.

## Database Candidate Env

| Name | Result |
| --- | --- |
| `AZURE_SUBSCRIPTION_ID` | MISSING |
| `AZURE_TENANT_ID` | MISSING |
| `AZURE_RESOURCE_GROUP` | MISSING |
| `AZURE_SQL_SERVER_NAME` | MISSING |
| `AZURE_SQL_DATABASE_NAME` | MISSING |
| `AZURE_BACKUP_STORAGE_ACCOUNT` | MISSING |
| `AZURE_BACKUP_CONTAINER` | MISSING |
| `SQLPACKAGE_PATH` | MISSING |
| `ICE_DATABASE_EXPORT_OUTPUT_DIR` | MISSING |
| `ICE_DATABASE_CONNECTION_STRING` | MISSING |
| `ICE_DATABASE_EXPORT_ENCRYPTION_METHOD` | MISSING |

## Media Candidate Env

| Name | Result |
| --- | --- |
| `ICE_MEDIA_STORAGE_ACCOUNT` | MISSING |
| `ICE_MEDIA_CONTAINER` | MISSING |
| `ICE_MEDIA_PUBLIC_HOST` | MISSING |
| `ICE_MEDIA_READ_ONLY_SAS` | MISSING |
| `ICE_MEDIA_BACKUP_OUTPUT_DIR` | MISSING |
| `ICE_MEDIA_COPY_MODE` | MISSING |

## Tooling

| Tool | Result |
| --- | --- |
| `node` | PRESENT |
| `npm` | PRESENT |
| `az` | PRESENT |
| `sqlpackage` | MISSING |

## Decision

Local Backup Center tooling was available. Database export tooling/env readiness was not available. Media blob copy/download env readiness was not available.

No Azure command was run. No database export command was run. No media copy/download command was run.

