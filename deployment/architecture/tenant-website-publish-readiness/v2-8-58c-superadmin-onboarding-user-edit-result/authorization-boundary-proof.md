# Authorization Boundary Proof

Result: pass.

Source proof:

- Role model is explicit in `UserRole`.
- User-management API routes require `SuperAdmin`.
- Admin UI navigation filters `Onboarding`, `Users/Admins`, and `Tenants` to `SuperAdmin`.
- Direct Admin UI routes render restricted state for non-SuperAdmin users.

Live API proof:

- SuperAdmin `GET /api/admin/users`: HTTP 200.
- TenantAdmin `GET /api/admin/users`: HTTP 403.

Live browser proof:

- SuperAdmin sees Onboarding nav: true.
- SuperAdmin sees Users/Admins nav: true.
- SuperAdmin onboarding route allowed: true.
- SuperAdmin users route allowed: true.
- TenantAdmin sees Onboarding nav: false.
- TenantAdmin sees Users/Admins nav: false.
- TenantAdmin direct onboarding denied: true.

