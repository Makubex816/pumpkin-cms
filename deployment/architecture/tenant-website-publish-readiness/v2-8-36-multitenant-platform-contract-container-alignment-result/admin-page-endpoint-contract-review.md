# Admin Page Endpoint Contract Review

Source routes:

- `GET /api/admin/pages`
- `GET /api/admin/pages/{tenantId}/{**pageSlug}`
- `POST /api/admin/pages/{tenantId}`
- `PUT /api/admin/pages/{tenantId}/{**pageSlug}`
- `POST /api/admin/pages/{tenantId}/{pageSlug}/rollback`

Tenant/auth behavior:

- Routes require JWT authentication.
- Routes read `tenantId` and role from JWT claims.
- Cross-tenant access is forbidden unless role is `SuperAdmin`.
- Create/update check that page body tenant ID is absent or matches the route tenant.
- Page writes and rollback were not exercised in V2.8.36.

Readiness:

- Source contract is present.
- `Page` container now exists with `/tenantId`.
- Live Admin GET proof was skipped because no parseable Admin credentials were available from the approved hard-copy.
