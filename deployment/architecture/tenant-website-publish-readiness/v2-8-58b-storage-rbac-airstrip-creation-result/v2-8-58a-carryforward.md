# V2.8.58A Carryforward

V2.8.58A completed the TenantAdmin route repair and deployed Pumpkin API exactly once under the prior approval.

Carryforward facts:

- Source-supported route: POST /api/admin/tenants/{tenantId}/tenant-admins.
- Route is SuperAdmin-only.
- Route checks tenant existence.
- Route handles duplicate email conflicts.
- Route hashes password with BCrypt.
- Route returns sanitized TenantAdmin response.
- Post-deploy health, SuperAdmin login, auth verify, and route readiness passed.
- Airstrip creation stopped before tenant/media/data mutation because Azure Blob RBAC data-plane access was missing.
- No Airstrip tenant or records remained after V2.8.58A.
