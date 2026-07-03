# SuperAdmin Read-Only Proof

Source-discovered routes:

- Login: `POST /api/auth/login`
- Tenant list: `GET /api/admin/tenants`

Result:

| check | result |
| --- | --- |
| SuperAdmin login status | 200 |
| Token returned | yes, not printed |
| Authenticated user role | SuperAdmin |
| Tenant list status | 200 |
| Tenant count | 1 |
| Read-only operation only | yes |

No tenant creation or tenant mutation route was called.

