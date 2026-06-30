# Static Contact Health Start State

Start-state GET-only checks:

| Target | Status | Public-safe body summary |
| --- | ---: | --- |
| Production apex `/api/static-contact-health` | 500 | `Backend call failure` |
| Production www `/api/static-contact-health` | 500 | `Backend call failure` |
| Production default host `/api/static-contact-health` | 500 | `Backend call failure` |
| Isolated `/api/static-contact-health` | 500 | `Backend call failure` |
| Pumpkin API `/api/health` | 200 | `ok=True; providerConfigured=False; providerStatus=not_checked` |
| Production apex `/`, `/contact`, `/service-areas` | 200 | HTML served |
| Production www `/`, `/contact`, `/service-areas` | 200 | HTML served |
| Production Admin UI `/login` | 200 | HTML served |

The initial PowerShell helper attempts failed locally before useful endpoint observations due unsupported local flags/assembly loading. The recorded start-state above comes from the completed GET-only probe.

