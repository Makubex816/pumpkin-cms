# Route Authz Proof

Source test proof:

- SuperAdmin role accepted.
- TenantAdmin role rejected by route helper.
- Missing role rejected by route helper.
- Created user role fixed to `TenantAdmin`.
- Created user tenant partition fixed to requested `tenantId`.
- Duplicate email returns conflict.
- Missing tenant returns not found.
- Response omits password and password hash.

Live route readiness proof:

- SuperAdmin login: HTTP 200.
- Auth verify: HTTP 200.
- Readiness probe against absent Airstrip tenant: HTTP 404.
- Airstrip tenant remained absent after readiness probe.

