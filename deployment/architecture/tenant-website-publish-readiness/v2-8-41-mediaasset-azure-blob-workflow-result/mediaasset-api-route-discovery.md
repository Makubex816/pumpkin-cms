# MediaAsset API Route Discovery

Source-discovered API routes:

| Route | Method | Source result |
| --- | --- | --- |
| `/api/admin/{tenantId}/media-assets` | GET | Present |
| `/api/admin/{tenantId}/media-assets/{id}` | GET | Present |
| `/api/admin/{tenantId}/media-assets` | POST | Present |
| `/api/admin/{tenantId}/media-assets/upload` | POST | Present |
| `/api/admin/{tenantId}/media-assets/{id}` | PATCH | Present |
| `/api/admin/{tenantId}/media-assets/{id}/archive` | POST | Present |
| `/api/admin/{tenantId}/media-assets/{id}/restore` | POST | Present |
| `/api/admin/{tenantId}/media-assets/{id}/replace` | POST | Present |
| MediaAsset hard delete | DELETE | Not found |

Live read proof:

- Admin login status: HTTP 200.
- Token found: yes, in process memory only.
- `GET /api/admin/{tenantId}/media-assets` status: HTTP 200.
- Tenant: `ice-rink-rentals`.
- Returned count: `0`.

Classification: `mediaasset_api_read_route_live`.
