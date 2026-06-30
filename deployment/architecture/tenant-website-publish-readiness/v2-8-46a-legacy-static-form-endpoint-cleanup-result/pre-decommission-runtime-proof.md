# Pre-Decommission Runtime Proof

All checks were GET-only before the decommission decision.

| Target | Status | Result |
| --- | ---: | --- |
| Production apex `/` | 200 | pass |
| Production apex `/contact` | 200 | pass |
| Production apex `/service-areas` | 200 | pass |
| Production apex `/api/static-contact-health` | 200 | pass |
| Production www `/` | 200 | pass |
| Production www `/contact` | 200 | pass |
| Production www `/service-areas` | 200 | pass |
| Production www `/api/static-contact-health` | 200 | pass |
| Isolated `/api/static-contact-health` | 200 | pass |
| Pumpkin API `/health` | 200 | pass; `providerConfigured:false` observed |
| Pumpkin API `/api/health` | 200 | pass; `providerConfigured:false` observed |
| Admin UI production `/` | 200 | pass |
| Admin UI production `/login` | 200 | pass |

No contact POST occurred.
