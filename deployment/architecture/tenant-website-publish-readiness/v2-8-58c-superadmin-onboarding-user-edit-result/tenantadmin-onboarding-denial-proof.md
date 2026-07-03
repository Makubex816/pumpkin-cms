# TenantAdmin Onboarding Denial Proof

Result: pass.

Proof:

- Airstrip TenantAdmin login: passed.
- TenantAdmin `Onboarding` nav visibility: false.
- TenantAdmin `Users/Admins` nav visibility: false.
- TenantAdmin direct `/dashboard/onboarding`: rendered `Access Restricted`.
- TenantAdmin call to `GET /api/admin/users`: HTTP 403.

This confirms the boundary does not rely only on front-end hiding.

