# Runtime No-Regression Proof

Classification: `get_only_no_regression_passed`

GET-only checks on July 1, 2026:

| Target | Route | Status |
| --- | --- | ---: |
| Ice apex | `/` | 200 |
| Ice apex | `/contact` | 200 |
| Ice apex | `/service-areas` | 200 |
| Ice apex | `/api/static-contact-health` | 200 |
| Ice www | `/` | 200 |
| Ice www | `/contact` | 200 |
| Ice www | `/service-areas` | 200 |
| Ice www | `/api/static-contact-health` | 200 |
| Isolated Static Web App | `/api/static-contact-health` | 200 |
| Pumpkin API | `/health` | 200 |
| Pumpkin API | `/api/health` | 200 |
| Admin UI production | `/` | 200 |
| Admin UI production | `/login` | 200 |
| Admin UI production | `/dashboard` | 200 |

Pumpkin API health still reports `providerConfigured:false` while returning HTTP 200.

No contact POST or form submission was sent.
