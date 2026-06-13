# Staging Package Validator Result

Status: passed after required static-form approval env was supplied.

Command shape:

```text
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613020714/repo/apps/ice-rink-web/out
```

Result:

| Field | Value |
| --- | --- |
| Site | `ice-rink-rentals` |
| File count | `41` |
| Local static integrity | passed |
| External approval gates | passed |
| Static form gate | `configured_owner_approved_backend_verified` |
| Errors | `0` |
| Warnings | `0` |

An initial validator invocation without the non-secret static-form env correctly blocked external approval gates. The corrected invocation supplied the approved process env and passed.
