# Admin API Read-Only Proof Result

Authenticated read-only GET proof:

| Endpoint | Status | Public-safe result |
| --- | --- | --- |
| `GET /api/admin/tenants` | 200 | count 1; active tenant present |
| `GET /api/admin/pages?tenantId=ice-rink-rentals` | 200 | count 0; tenant ID echoed |
| `GET /api/admin/tenants/ice-rink-rentals/hubs` | 200 | count 0 |
| `GET /api/admin/tenants/ice-rink-rentals/content-hierarchy` | 200 | total pages 0; hubs 0; orphans 0; clusters 0 |

Sitemap proof:

- Not attempted because no tenant API key was included in the approved secure field list.

Classification:

`admin_api_readonly_proof_passed`.
