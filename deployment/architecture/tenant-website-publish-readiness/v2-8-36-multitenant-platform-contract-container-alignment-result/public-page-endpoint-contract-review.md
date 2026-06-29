# Public Page Endpoint Contract Review

Source routes:

- `GET /api/pages/{tenantId}/{**pageSlug}`
- `POST /api/pages/{tenantId}`
- `PUT /api/pages/{tenantId}/{**pageSlug}`
- `DELETE /api/pages/{tenantId}/{**pageSlug}`

Tenant/auth behavior:

- Each route extracts a bearer API key from the Authorization header.
- Page data access validates the API key against the `Tenant` container for the route `tenantId`.
- Public page reads query `Page` by `tenantId`, `pageSlug`, and `isPublished=true`.
- Public writes were not exercised in V2.8.36.

Readiness:

- Source contract is present.
- Live container dependency is aligned because `Page` now exists with `/tenantId`.
- Public page/sitemap live proof was not run because an approved API key was not available in memory for this phase.
