# Tenant Admin RBAC Contract Review

Source result:

- Admin JWT claims include user ID, email, username, role, and `tenantId`.
- `/api/admin/tenants` returns all active tenants for SuperAdmin and own tenant for non-SuperAdmin users.
- Specific tenant read/create/update/delete and API key regeneration are SuperAdmin-only.
- Tenant delete cannot delete the caller's own tenant.
- `/api/admin/pages` defaults to the caller tenant and permits a query tenant only when the caller is SuperAdmin.
- `/api/admin/pages/{tenantId}/{**pageSlug}` rejects cross-tenant access unless the caller is SuperAdmin.
- Content hierarchy, FormEntry, media, publish-run, and import-run Admin routes use the same own-tenant-or-SuperAdmin check.

Risk note:

`CosmosDataConnection.GetAllPagesAsync` has an all-tenant mode when called with no tenant ID, but the active Admin route reviewed in V2.8.36 calls the tenant-scoped page method. Future source changes must keep all-tenant page access SuperAdmin/system-only.
