# API Write Endpoint Result

Pumpkin API write endpoint scaffolding was added for scoped local/fake operation:

- `PATCH /api/admin/outbound-links/{id}/status`
- `PATCH /api/admin/outbound-link-instances/{id}/status`
- `PUT /api/admin/outbound-link-policies`
- `POST /api/admin/outbound-link-scan-runs`
- `POST /api/admin/outbound-links/bulk-actions`
- `POST /api/admin/outbound-links/review-decisions`
- `POST /api/admin/outbound-links/{id}/restore-status`

Endpoints route through `OutboundLinkWriteActionService`, guard services, trace logging, and `OutboundLinkWriteFakeProvider`. No production database provider is wired.
