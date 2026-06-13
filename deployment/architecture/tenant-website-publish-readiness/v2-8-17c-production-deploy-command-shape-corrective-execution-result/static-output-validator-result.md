# Static Output Validator Result

Status: passed.

Command shape:

```text
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out <selected-artifact-root>
```

Result:

| Field | Value |
| --- | --- |
| File count | `41` |
| Local static integrity | `true` |
| External approval gates | `true` |
| Gate classification | `passed` |
| Local static integrity errors | `0` |
| External approval gates | `0` |
| Warnings | `0` |
| Static form gate | `configured_owner_approved_backend_verified` |

The validator used the approved public endpoint shape and approval booleans in process environment. No protected config was read.

