# Vegas Redirect Dry-Run Validation

Actual route-map input and fresh live existing-redirect accounting produced:

| Field | Result |
| --- | ---: |
| Source declarations | 3 |
| Existing idempotent no-ops | 1 |
| Future create actions | 2 |
| Blocked declarations | 0 |
| Cycles | 0 |
| Persisted objects after a future apply | 3 |
| Status | `persistable_idempotent_plan` |

Future actions:

1. `/guides/couples-night` -> `/guides/couples-guide-vegas`, `301`.
2. `/guides/dress-code-what-to-expect` -> `/guides/dress-code`, `301`.

Both actions include explicit page-shadow precedence because each source is an existing page route. The matching page contract passed with 43 pages, 3 redirect declarations, 0 errors, and 0 warnings.

This is local dry-run proof only. Live authenticated validation failed in the deployed Linux build, and no action payload was sent to a create or update endpoint.
