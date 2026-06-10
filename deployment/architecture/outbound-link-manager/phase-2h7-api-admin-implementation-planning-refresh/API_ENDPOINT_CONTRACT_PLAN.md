# API Endpoint Contract Plan

The future API should use the current Pumpkin API minimal endpoint style and keep all endpoints under `/api/admin/`. Every endpoint must require authentication, tenant authorization, and tenant/site scope.

## Read Endpoints

| Method | Path | Purpose | Required scope |
| --- | --- | --- | --- |
| GET | `/api/admin/outbound-links` | List registry records with filters and pagination | `tenantId`, `siteId` |
| GET | `/api/admin/outbound-links/{id}` | Read one registry record, policy state, and summary counts | record tenant/site |
| GET | `/api/admin/outbound-links/{id}/instances` | List placements for one registry record | record tenant/site |
| GET | `/api/admin/outbound-link-instances` | Search placements directly | `tenantId`, `siteId` |
| GET | `/api/admin/outbound-link-policies` | Read tenant/site policy | `tenantId`, `siteId` |
| GET | `/api/admin/outbound-link-scan-runs` | List scan-run summaries | `tenantId`, `siteId` |
| GET | `/api/admin/outbound-link-audit` | List audit entries | `tenantId`, `siteId` |

Recommended list query fields:

- `tenantId`
- `siteId`
- `q`
- `url`
- `domain`
- `status`
- `instanceStatus`
- `pageId`
- `contentType`
- `anchorText`
- `reviewState`
- `firstDetectedFrom`
- `firstDetectedTo`
- `lastDetectedFrom`
- `lastDetectedTo`
- `sort`
- `cursor`
- `limit`

## Future Write Endpoints

Write endpoints remain future-only and must be guarded by explicit approval.

| Method | Path | Purpose | Gate |
| --- | --- | --- | --- |
| POST | `/api/admin/outbound-link-scan-runs` | Create an approved scan run | preview or local/fake first |
| PATCH | `/api/admin/outbound-links/{id}/status` | Change global link status | reason, permission, audit |
| PATCH | `/api/admin/outbound-link-instances/{id}/status` | Change one placement status | reason, permission, audit |
| PUT | `/api/admin/outbound-link-policies` | Replace tenant/site policy | preview, validation, audit |
| POST | `/api/admin/outbound-links/bulk-actions` | Preview or execute bulk actions | preview-before-execute |

## Response Rules

- Every list response returns `{ items, pageInfo, filters, tenantId, siteId }`.
- Every mutation response returns the changed entity, audit id, and operation id.
- Bulk action preview returns an immutable preview id and matched entity summaries.
- Execution requires the preview id, expected count, reason, and idempotency key.
- Error responses must use stable machine-readable codes and safe human messages.

## Status Codes

| Code | Use |
| --- | --- |
| 200 | Read success or mutation success |
| 202 | Accepted long-running scan run |
| 400 | Invalid query or payload |
| 401 | Missing or invalid authentication |
| 403 | Tenant, role, or mode gate denied |
| 404 | Tenant-scoped entity not found |
| 409 | Conflict, stale ETag, preview mismatch, or duplicate normalized URL |
| 422 | Valid JSON but unsafe operation |
| 429 | Rate or scan concurrency limit |

