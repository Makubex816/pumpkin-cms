# Static Output Validator Result

Status: passed.

Command shape:

```text
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612235412/repo/apps/ice-rink-web/out
```

The validator used the approved public static form endpoint and boolean owner/backend verification flags from process environment. No protected config was read.

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

The static output validator passed against the fresh sanitized artifact root.
