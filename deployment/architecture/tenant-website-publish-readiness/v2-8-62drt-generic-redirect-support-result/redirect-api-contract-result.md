# Redirect API Contract Result

Final routes:

| Method | Route | Authorization | Behavior |
| --- | --- | --- | --- |
| GET | `/api/admin/tenants/{tenantId}/redirects` | JWT Admin | list active or optionally inactive records |
| POST | `/api/admin/tenants/{tenantId}/redirects` | JWT Admin | validate and create; exact replay is idempotent |
| PUT | `/api/admin/tenants/{tenantId}/redirects/{redirectId}` | JWT Admin | update target/status/config; source is immutable |
| DELETE | `/api/admin/tenants/{tenantId}/redirects/{redirectId}` | JWT Admin | soft-deactivate |
| POST | `/api/admin/tenants/{tenantId}/redirects/validate` | JWT Admin | non-mutating validation |
| GET | `/api/redirects/{tenantId}/resolve` | tenant API key | return minimal runtime location/status metadata |

Validation reports normalized source and target, target resolution, page shadow, route precedence, conflicts, warnings, and cycles. Runtime responses do not expose audit, actor, source-package, or import metadata.

Live readiness proof:

- no-auth list: HTTP `401`;
- no-auth validate: HTTP `401`;
- health: HTTP `200`;
- authenticated list: HTTP `200`, generic Vegas count `0`;
- authenticated internal validation: HTTP `400` in the deployed build because of the Linux path-classification defect documented in `redirect-endpoint-readiness-proof.md`.
