# Staging Package Validator Result

Status: passed.

Command shape:

```text
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612235412/repo/apps/ice-rink-web/out
```

The validator used only the approved public static form endpoint and boolean approval/verification flags from process environment.

Result:

| Field | Value |
| --- | --- |
| `ok` | `true` |
| File count | `41` |
| Local static integrity | `true` |
| External approval gates | `true` |
| Structural errors | `0` |
| External approval gates count | `0` |
| Warnings | `0` |
| Static form gate | `configured_owner_approved_backend_verified` |

The staging package validator passed against the exact artifact deployed in V2.8.14C.
