# Database Env Presence Plan

Future execution must check presence only. Values must not be printed, logged, written, or copied into reports.

## Candidate Variables

| Variable | Purpose | Required When |
| --- | --- | --- |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription selection | Azure evidence/export mode |
| `AZURE_TENANT_ID` | Azure identity selection | Azure CLI/service principal mode |
| `AZURE_RESOURCE_GROUP` | Resource group selection | Azure evidence/export mode |
| `AZURE_SQL_SERVER_NAME` | SQL server identifier | Azure evidence/export mode |
| `AZURE_SQL_DATABASE_NAME` | SQL database identifier | Azure evidence/export mode |
| `AZURE_BACKUP_STORAGE_ACCOUNT` | Export target storage | Azure export-to-storage mode |
| `AZURE_BACKUP_CONTAINER` | Export target container | Azure export-to-storage mode |
| `AZURE_CLIENT_ID` | Service principal identity | Service principal mode only |
| `AZURE_CLIENT_SECRET` | Service principal credential | Service principal mode only |
| `SQLPACKAGE_PATH` | Local sqlpackage executable | `sqlpackage` mode |
| `ICE_DATABASE_EXPORT_OUTPUT_DIR` | Local ignored output root | Local export mode |
| `ICE_DATABASE_CONNECTION_STRING` | DB connection value | Only if unavoidable and explicitly approved |
| `ICE_DATABASE_EXPORT_ENCRYPTION_METHOD` | Artifact encryption mode | Portable artifact mode |

## Presence-Only Output Format

Allowed:

```text
AZURE_SQL_DATABASE_NAME PRESENT
AZURE_SQL_DATABASE_NAME MISSING
```

Not allowed:

- env values;
- command lines containing secret values;
- connection strings;
- storage keys;
- SAS URLs;
- access tokens;
- copied content from protected config.

## Recommendation

Avoid `ICE_DATABASE_CONNECTION_STRING` unless there is no safer Azure identity/export path. Prefer Azure identity or operator-provided evidence where possible.

