# Runtime No-Regression Proof

All checks were GET-only.

| Target | Status | Result |
| --- | ---: | --- |
| Production apex `/api/static-contact-health` | 200 | pass |
| Production www `/api/static-contact-health` | 200 | pass |
| Production default host `/api/static-contact-health` | 200 | pass |
| Production apex `/` | 200 | pass |
| Production apex `/contact` | 200 | pass |
| Production apex `/service-areas` | 200 | pass |
| Production www `/` | 200 | pass |
| Production www `/contact` | 200 | pass |
| Production www `/service-areas` | 200 | pass |
| Pumpkin API `/health` | 200 | pass; `providerConfigured:false` observed |
| Pumpkin API `/api/health` | 200 | pass; `providerConfigured:false` observed |
| Production Admin UI `/` | 200 | pass |
| Production Admin UI `/login` | 200 | pass |

No contact POST was sent.
