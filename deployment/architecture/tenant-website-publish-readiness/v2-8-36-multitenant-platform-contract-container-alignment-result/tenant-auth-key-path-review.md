# Tenant Auth Key Path Review

Public tenant auth:

- Public page and sitemap endpoints extract bearer API key from Authorization.
- Source validates the API key against the `Tenant` container for the route `tenantId`.
- Tenant source requires active tenant status and active API key metadata.

Admin auth:

- Login uses `{ email, password }`.
- Successful login returns JWT and user context.
- JWT claims include role and `tenantId`.
- Admin routes use JWT tenant/role context to block cross-tenant access unless SuperAdmin.

Live proof:

- Approved hard-copy path existed and hash matched.
- No parseable Admin/API values were available under labels used by this phase.
- Admin login and public sitemap proof were skipped to avoid secret handling drift.

Classification: source auth/key path ready; live credential-backed proof deferred.
