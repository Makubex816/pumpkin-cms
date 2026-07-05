# Runtime No-Regression Proof

Status: passed after failed deploy attempt.

All checks were GET-only.

| Target | Status |
| --- | ---: |
| Pumpkin API `/health` | 200 |
| Pumpkin API `/api/health` | 200 |
| Admin UI production `/` | 200 |
| Admin UI production `/login` | 200 |
| Admin UI production `/dashboard` | 200 |
| Ice apex `/` | 200 |
| Ice apex `/contact` | 200 |
| Ice apex `/service-areas` | 200 |
| Ice apex `/api/static-contact-health` | 200 |
| Ice www `/` | 200 |
| Ice www `/contact` | 200 |
| Ice www `/service-areas` | 200 |
| Ice www `/api/static-contact-health` | 200 |
| Airstrip production default `/` | 200 |
| Airstrip production default `/request-booking` | 200 |
| Airstrip production default `/packages` | 200 |
| Airstrip production default `/airstrip-the-club` | 200 |

No contact POST or form submission occurred.
