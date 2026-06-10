# API Endpoint Plan

This is an endpoint plan only. No API implementation is approved in Phase 2H-1.

## Read Endpoints

`GET /api/admin/outbound-links`

List tenant-scoped outbound links with filters for URL, domain, status, page, anchor text, dates, and review state.

`GET /api/admin/outbound-links/{id}`

Return one outbound link with policy state and summary counts.

`GET /api/admin/outbound-links/{id}/instances`

Return instances for one outbound link.

`GET /api/admin/outbound-links/audit`

Return tenant-scoped audit log entries.

`GET /api/admin/outbound-link-policies`

Return tenant/site outbound link policy.

## Future Write Endpoints

Write endpoints require later approval, permission enforcement, audit logging, validation, and preview where applicable.

`POST /api/admin/outbound-links/scan-runs`

Start a scan run. Local scanner and live-readonly scanner modes must be explicit.

`PATCH /api/admin/outbound-links/{id}/status`

Change global link status.

`PATCH /api/admin/outbound-link-instances/{id}/status`

Change one placement status.

`POST /api/admin/outbound-links/bulk-actions`

Create a preview or execute an approved bulk action.

`PUT /api/admin/outbound-link-policies`

Update tenant/site policy.

## API Guardrails

- Every endpoint requires tenant and site authorization.
- Read results must not leak other tenants.
- Write endpoints must reject missing reason text for disable/block actions.
- Bulk actions require preview before execution.
- Scan endpoints must reject external crawling in local/offline modes.
- API responses must not include tokens, cookies, auth headers, or protected config values.
