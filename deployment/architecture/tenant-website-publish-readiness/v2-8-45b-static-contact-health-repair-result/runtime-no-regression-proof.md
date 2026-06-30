# Runtime No-Regression Proof

Final GET-only proof:

| Check | Status | Summary |
| --- | ---: | --- |
| Production apex `/api/static-contact-health` | 500 | `Backend call failure` |
| Production www `/api/static-contact-health` | 500 | `Backend call failure` |
| Production default host `/api/static-contact-health` | 500 | `Backend call failure` |
| Isolated `/api/static-contact-health` | 500 | `Backend call failure` |
| Production apex `/` | 200 | HTML served |
| Production apex `/contact` | 200 | HTML served |
| Production apex `/service-areas` | 200 | HTML served |
| Production www `/` | 200 | HTML served |
| Production www `/contact` | 200 | HTML served |
| Production www `/service-areas` | 200 | HTML served |
| Pumpkin API `/health` | 200 | `ok=True; providerConfigured=False; providerStatus=not_checked` |
| Pumpkin API `/api/health` | 200 | `ok=True; providerConfigured=False; providerStatus=not_checked` |
| Production Admin UI `/` | 200 | HTML served |
| Production Admin UI `/login` | 200 | HTML served |

No contact POST was sent.

