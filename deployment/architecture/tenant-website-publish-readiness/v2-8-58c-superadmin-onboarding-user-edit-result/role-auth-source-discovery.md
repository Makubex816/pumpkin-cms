# Role And Auth Source Discovery

Source-discovered role model:

- `apps/pumpkin-net-models/Models/User.cs`
- Roles: `SuperAdmin`, `TenantAdmin`, `Editor`, `Viewer`.

Source-discovered auth claims:

- `apps/pumpkin-api/Program.cs`
- JWT includes `ClaimTypes.Role`, `ClaimTypes.Email`, `ClaimTypes.NameIdentifier`, `ClaimTypes.Name`, and `tenantId`.

Source-discovered existing SuperAdmin guard:

- Tenant creation, tenant update, tenant delete, API-key regeneration, and TenantAdmin creation routes already required `SuperAdmin`.

V2.8.58C added the same SuperAdmin-only authorization boundary to user-management routes.

