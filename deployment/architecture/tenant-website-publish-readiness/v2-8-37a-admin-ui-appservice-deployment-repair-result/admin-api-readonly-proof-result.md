# Admin API Read-Only Proof Result

Authenticated read-only proof used the token returned by live Admin login. The token was not printed or written.

Results:

- `GET /api/admin/tenants`: HTTP 200.
- Tenant count: 1.
- Expected tenant visible: true.
- `GET /api/admin/pages?tenantId=...`: HTTP 200.
- Page count: 0.
- `GET /api/admin/tenants/{tenantId}/hubs`: HTTP 200.
- Hub count: 0.
- `GET /api/admin/tenants/{tenantId}/content-hierarchy`: HTTP 200.
- Content hierarchy total pages: 0.

Classification:

`admin_api_readonly_proof_succeeded_container_ready_no_content_seeded`
