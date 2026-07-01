# API Route Parity

Classification: `mostly_additive_with_p0_external_alias_gaps`

External route count: 39

Current route count: 60

Current added routes include:

- `/health`
- `/api/health`
- `/api/auth/verify`
- `/api/auth/logout`
- `/api/admin/provider-metadata`
- Page export/import/delete/rollback routes.
- MediaAsset routes.
- PublishRun routes.
- ImportRun routes.

External routes missing from current source:

| Method | Route | Impact |
| --- | --- | --- |
| POST | `/api/forms/{tenantId}/submit/{type}` | P0 external ergonomic form submit compatibility. |
| GET | `/api/admin/forms/{tenantId}/entries` | P0 external admin FormEntry list alias. |
| GET | `/api/admin/forms/{tenantId}/entries/{entryId}` | P0 external admin FormEntry detail alias. |
| PUT | `/api/admin/forms/{tenantId}/entries/{entryId}/status` | P0 external admin status update alias. |

Current replacement routes:

- `/api/admin/{tenantId}/form-entries`
- `/api/admin/{tenantId}/form-entries/{id}`

Decision:

Add compatibility aliases rather than breaking either route family.
