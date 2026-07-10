# Runtime No-Regression Proof

Result: passed, GET-only.

No Airstrip routes were probed.

| Route group | Result |
| --- | --- |
| Ice apex/www `/`, `/contact`, `/service-areas` | 6/6 HTTP 200 |
| Ice apex/www `/api/static-contact-health` | 2/2 HTTP 200 |
| Pumpkin API `/health`, `/api/health` | 2/2 HTTP 200 |
| Admin UI `/`, `/login`, `/dashboard` | 3/3 HTTP 200 |
| Starter default host `/` | HTTP 200 |
| Party Pros preview routes | 3/3 HTTP 200 |
| Party Pros custom-domain routes | 6/6 HTTP 200 |

Total: 23/23 GET-only checks returned HTTP 200.

No POST, deploy, DNS, appsetting mutation, CMS mutation, or Airstrip action was performed during no-regression proof.
