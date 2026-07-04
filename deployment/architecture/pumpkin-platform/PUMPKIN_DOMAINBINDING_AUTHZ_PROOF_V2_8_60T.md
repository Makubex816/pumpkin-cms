# Pumpkin DomainBinding Authz Proof V2.8.60T

Status: passed.

DomainBinding routes are SuperAdmin-only.

Source proof:

- SuperAdmin role accepted.
- TenantAdmin role rejected.
- Missing role rejected.

Live proof:

- SuperAdmin login succeeded.
- Airstrip TenantAdmin login succeeded.
- TenantAdmin received HTTP 403 for all DomainBinding routes tested.

Routes denied to TenantAdmin:

- GET `/api/admin/domain-bindings`
- GET tenant DomainBinding list
- GET tenant DomainBinding item
- POST tenant DomainBinding create
- PUT tenant DomainBinding update
- POST DNS packet generation
- POST read-only DNS validation

No frontend-only authorization is relied on.

