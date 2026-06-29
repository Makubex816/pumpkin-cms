# Pre-Mutation Admin Readiness

Admin login:

- Status: HTTP 200.
- Token received: true.
- Token printed: false.
- Role: `TenantAdmin`.
- Tenant matched expected tenant: true.

Tenant read:

- `GET /api/admin/tenants`: HTTP 200.
- Tenant count: 1.
- Expected tenant visible: true.

Pages read:

- `GET /api/admin/pages?tenantId=ice-rink-rentals`: HTTP 200.
- Page count before proof: 0.

Synthetic slug collision check:

- `GET /api/admin/pages/ice-rink-rentals/pumpkin-proof-v2-8-38-page-content-proof-20260629201535-1023d4`: HTTP 404.
- The proof slug was absent before create.
