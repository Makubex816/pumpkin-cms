# Current Build Adapter Map

## External Compatibility Adapters

| External shape | Current adapter |
| --- | --- |
| `POST /api/forms/{tenantId}/submit/{type}` | New alias normalizes wrapper/flat payloads and saves through existing FormEntry service |
| `GET /api/admin/forms/{tenantId}/entries` | New alias maps to existing tenant-scoped FormEntry list |
| `GET /api/admin/forms/{tenantId}/entries/{entryId}` | New alias maps to existing tenant-scoped FormEntry detail read |

## Preserved Current Routes

| Current route | Status |
| --- | --- |
| `POST /api/forms/{tenantId}/entries` | preserved |
| `GET /api/forms/{tenantId}/definitions/{type}` | preserved |
| `GET /api/admin/{tenantId}/form-entries` | preserved |
| `GET /api/admin/{tenantId}/form-entries/{id}` | preserved |
| `PATCH /api/admin/{tenantId}/form-entries/{id}` | preserved |
| Admin FormDefinition CRUD | preserved |

## Remaining Adapter Work

Ice/Roller static build and Admin preview assumptions still need a data-driven tenant/site adapter before any new secondary tenant is created.
