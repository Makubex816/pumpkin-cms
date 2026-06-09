# Media Env Presence Plan

Future execution must check presence only. Values must not be printed, logged, written, or copied into reports.

## Candidate Variables

| Variable | Purpose | Required When |
| --- | --- | --- |
| `ICE_MEDIA_STORAGE_ACCOUNT` | Source media storage account identifier | Storage-copy mode |
| `ICE_MEDIA_CONTAINER` | Source media container identifier | Storage-copy mode |
| `ICE_MEDIA_PUBLIC_HOST` | Public media host label | URL mapping/evidence mode |
| `ICE_MEDIA_READ_ONLY_SAS` | Read-only blob access | SAS mode only |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription selection | Azure identity/storage mode |
| `AZURE_TENANT_ID` | Azure identity selection | Azure identity/storage mode |
| `AZURE_RESOURCE_GROUP` | Resource group selection | Azure identity/storage mode |
| `AZURE_BACKUP_STORAGE_ACCOUNT` | Destination storage account | Private backup storage mode |
| `AZURE_BACKUP_CONTAINER` | Destination backup container | Private backup storage mode |
| `ICE_MEDIA_BACKUP_OUTPUT_DIR` | Local ignored output root | Local copy mode |
| `ICE_MEDIA_COPY_MODE` | Selected copy mode marker | Any media execution |

## Presence-Only Output Format

Allowed:

```text
ICE_MEDIA_CONTAINER PRESENT
ICE_MEDIA_CONTAINER MISSING
```

Not allowed:

- SAS URLs;
- storage keys;
- access tokens;
- signed URLs;
- credential-bearing command lines;
- protected config content.

## Recommendation

Prefer Azure identity or narrowly scoped read-only source access. If SAS access is used, it must be provided only through process env, never printed, never written, and never persisted in standard backup artifacts.

