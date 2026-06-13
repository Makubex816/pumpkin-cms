# Staging Package Validator Result

Status: passed.

Command:

```text
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613014405/repo/apps/ice-rink-web/out
```

Result:

| Field | Value |
| --- | --- |
| `ok` | `true` |
| File count | `41` |
| Local static integrity | `true` |
| External approval gates | `true` |
| Errors | `0` |
| Warnings | `0` |
| Static form gate | `configured_owner_approved_backend_verified` |

