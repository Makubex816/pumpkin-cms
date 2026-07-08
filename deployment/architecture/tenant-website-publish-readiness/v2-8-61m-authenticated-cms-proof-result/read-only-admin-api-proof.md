# Read-Only Admin API Proof

Status: passed.

Selected tenant: `ice-rink-rentals`.

Airstrip-specific public routes and Airstrip tenant-scoped protected reads were not used.

| Surface | Method | Route shape | Status | Count | Detail status |
| --- | --- | --- | --- | --- | --- |
| Tenant list | GET | `/api/admin/tenants` | 200 | 2 | n/a |
| Tenant row | GET | `/api/admin/tenants/{tenantId}` | 200 | 1 | n/a |
| Users/Admins sanitized list | GET | `/api/admin/users?tenantId={tenantId}` | 200 | 2 | n/a |
| Pages | GET | `/api/admin/pages?tenantId={tenantId}` | 200 | 3 | 200 |
| Themes | GET | `/api/admin/themes/{tenantId}` | 200 | 1 | 200 |
| Active theme | GET | `/api/admin/themes/{tenantId}/active` | 200 | 1 | n/a |
| MediaAsset | GET | `/api/admin/{tenantId}/media-assets` | 200 | 9 | 200 |
| FormDefinitions | GET | `/api/admin/forms/{tenantId}/definitions` | 200 | 1 | 200 |
| FormEntries legacy route | GET | `/api/admin/{tenantId}/form-entries` | 200 | 5 | 200 |
| FormEntries forms route | GET | `/api/admin/forms/{tenantId}/entries` | 200 | 5 | 200 |
| DomainBindings all list | GET | `/api/admin/domain-bindings` | 200 | 1 | n/a |
| DomainBindings selected tenant | GET | `/api/admin/tenants/{tenantId}/domain-bindings` | 200 | 0 | n/a |
| PublishRuns | GET | `/api/admin/{tenantId}/publish-runs` | 200 | 1 | 200 |
| ImportRuns | GET | `/api/admin/{tenantId}/import-runs` | 200 | 1 | 200 |

Only statuses and counts were recorded. Full tenant records and response payloads were not copied into repo outputs.
