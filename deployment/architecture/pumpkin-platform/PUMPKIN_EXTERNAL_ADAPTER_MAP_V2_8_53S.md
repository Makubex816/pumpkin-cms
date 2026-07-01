# Pumpkin External Adapter Map V2.8.53S

| External contract shape | Current Pumpkin adapter |
| --- | --- |
| `POST /api/forms/{tenantId}/submit/{type}` | Additive alias in Pumpkin API; wrapper/flat JSON accepted |
| default contact/quote submit aliases | routed through existing default FormEntry guard |
| dynamic non-default submit alias | requires active/published FormDefinition and dynamic guard |
| `GET /api/admin/forms/{tenantId}/entries` | Additive alias over existing tenant-scoped FormEntry list |
| `GET /api/admin/forms/{tenantId}/entries/{entryId}` | Additive alias over existing tenant-scoped FormEntry detail read |

Current-build preservation:

- Existing current routes remain valid.
- Live container names remain singular Pascal-style.
- Admin auth boundary remains JWT plus tenant match unless `SuperAdmin`.

Remaining adapter work:

- Generalize Ice/Roller site and publish assumptions before secondary tenant creation.
