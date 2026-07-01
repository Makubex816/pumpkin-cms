# External Contract Preservation Result

Preserved external contract behavior by adding aliases instead of replacing current routes.

Added:

- `POST /api/forms/{tenantId}/submit/{type}`
- `GET /api/admin/forms/{tenantId}/entries`
- `GET /api/admin/forms/{tenantId}/entries/{entryId}`

Preserved:

- existing `POST /api/forms/{tenantId}/entries`
- existing `GET /api/admin/{tenantId}/form-entries`
- existing `GET /api/admin/{tenantId}/form-entries/{id}`
- existing `PATCH /api/admin/{tenantId}/form-entries/{id}`
- default contact and quote validation path
- singular live Cosmos container names

No external repo, external database, or external dependent system was changed or swapped.
