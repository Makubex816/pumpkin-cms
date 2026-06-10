# API Endpoint Implementation Plan

No Pumpkin API implementation is approved in Phase 2H-2.

## Future Read Controllers

Recommended location:

```text
apps/pumpkin-api/Controllers/OutboundLinksController.cs
apps/pumpkin-api/Services/OutboundLinks/
apps/pumpkin-api/Models/OutboundLinks/
```

## Future Endpoints

Read endpoints:

- `GET /api/admin/outbound-links`
- `GET /api/admin/outbound-links/{id}`
- `GET /api/admin/outbound-links/{id}/instances`
- `GET /api/admin/outbound-links/audit`
- `GET /api/admin/outbound-link-policies`

Future write endpoints:

- `POST /api/admin/outbound-links/scan-runs`
- `PATCH /api/admin/outbound-links/{id}/status`
- `PATCH /api/admin/outbound-link-instances/{id}/status`
- `POST /api/admin/outbound-links/bulk-actions`
- `PUT /api/admin/outbound-link-policies`

## API Gates

- Read-only endpoints first.
- Write endpoints require permission service, audit service, and restore/backout notes.
- Scan-run endpoints must reject external crawling unless a future approval allows a health-check mode.
- Every endpoint must require tenant/site authorization before loading records.
