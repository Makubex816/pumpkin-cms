# Source Tenant Scope Audit

Passes:

- Public page routes include `{tenantId}` and validate tenant API key.
- Public sitemap route includes `{tenantId}` and validates tenant API key.
- Admin JWT includes `tenantId`.
- Admin page routes use JWT tenant claim and SuperAdmin checks.
- Content hierarchy routes enforce own-tenant or SuperAdmin.
- FormEntry, media, publish-run, and import-run Admin routes enforce own-tenant or SuperAdmin.
- Active source queries for page/media/import/publish paths filter by tenant.

Care points:

- Some internal query methods can operate across all tenants if called without tenant scope. Future callers must keep those paths SuperAdmin or system-only.
- Admin UI has tenant-aware import/export and current-tenant behavior, but it is not deployed live yet.

Classification: source tenant scope is suitable for active V2.8.36 readiness, with all-tenant helper methods requiring future guard discipline.
