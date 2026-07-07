# Admin Login Inventory Redacted

SuperAdmin login was verified through the live Pumpkin API using the approved current credential from V2.8.60WC. The returned bearer token was used only in memory and was not written to the hardcopy or repo.

Admin users observed through sanitized API readback:

| Tenant | Email | Role | Active |
| --- | --- | --- | --- |
| `airstrip-club-las-vegas` | `steviedog2002@gmail.com` | `TenantAdmin` | true |
| `ice-rink-rentals` | `admin@pumpkincms.io` | `TenantAdmin` | true |
| `ice-rink-rentals` | `spectre.dev@pumpkincms.io` | `SuperAdmin` | true |

Plaintext credentials are recoverable only where included in approved outside hardcopies. Password hashes were not written to repo reports.
