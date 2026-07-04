# DomainBinding Authz Proof

Status: passed.

Source tests:

- SuperAdmin role accepted.
- TenantAdmin role rejected.
- Missing role rejected.

Live proof:

- SuperAdmin login: HTTP 200.
- Airstrip TenantAdmin login: HTTP 200.
- TenantAdmin route attempts all returned HTTP 403.

TenantAdmin denial routes:

| Route | Status |
| --- | --- |
| GET `/api/admin/domain-bindings` | 403 |
| GET tenant binding list | 403 |
| GET tenant binding item | 403 |
| POST tenant binding create | 403 |
| PUT tenant binding update | 403 |
| POST DNS packet generation | 403 |
| POST read-only DNS validation | 403 |

No frontend hiding is relied on for authorization.

