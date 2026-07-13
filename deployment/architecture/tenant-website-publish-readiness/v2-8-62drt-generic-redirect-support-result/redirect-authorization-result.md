# Redirect Authorization Result

Admin authorization follows existing JWT claims:

- `SuperAdmin`: may manage redirects for any tenant.
- `TenantAdmin`: may access only the tenant matching its `tenantId` claim.
- Any other role: denied.
- Unauthenticated Admin request: `401`.
- Cross-tenant TenantAdmin request: `403` equivalent denial.

Focused tests passed SuperAdmin access, TenantAdmin own-tenant access, TenantAdmin cross-tenant denial, and unsupported-role denial.

The runtime resolver does not infer access from the URL tenant ID. It validates the bearer API key against that tenant before querying the tenant partition and returns only location, status, and query-preservation metadata.

Live proof used the approved SuperAdmin handoff in memory. No token, password, cookie, API key, or authorization header was printed or persisted.
