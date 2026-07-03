# Pumpkin TenantAdmin Route Repair V2.8.58A

Status: implemented, tested, built, and deployed.

Route:

- `POST /api/admin/tenants/{tenantId}/tenant-admins`.
- SuperAdmin-only.
- Creates active `TenantAdmin` users for existing tenants.
- Uses BCrypt password hashing.
- Stores users in the existing `User` container/collection with `tenantId` partitioning.
- Does not return password or password hash.

Production deploy:

- Deployment ID: `b74e7431-d13c-4313-9781-a72ee76e16c0`.
- Health after deploy: HTTP 200 for `/health` and `/api/health`.

