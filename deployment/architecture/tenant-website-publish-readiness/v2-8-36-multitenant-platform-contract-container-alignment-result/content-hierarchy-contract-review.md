# Content Hierarchy Contract Review

Source routes:

- `GET /api/admin/tenants/{tenantId}/hubs`
- `GET /api/admin/tenants/{tenantId}/hubs/{hubPageSlug}/spokes`
- `GET /api/admin/tenants/{tenantId}/content-hierarchy`

Tenant/auth behavior:

- Routes require JWT authentication.
- Routes reject cross-tenant access unless the caller is SuperAdmin.
- Source queries filter `Page` records by `tenantId`.
- Hubs use `contentRelationships.isHub`.
- Spokes use `contentRelationships.hubPageSlug`.

Readiness:

- Source contract is present.
- `Page` container now exists with `/tenantId`.
- Live Admin content hierarchy proof was skipped because no parseable Admin credentials were available from the approved hard-copy.
