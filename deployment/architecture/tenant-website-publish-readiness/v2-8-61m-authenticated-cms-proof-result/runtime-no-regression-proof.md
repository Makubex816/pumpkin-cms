# Runtime No-Regression Proof

Status: passed.

Method: GET-only.

Airstrip probed: no.

| Target | Status | Content type |
| --- | --- | --- |
| Ice apex `/` | 200 | text/html |
| Ice apex `/contact` | 200 | text/html |
| Ice apex `/service-areas` | 200 | text/html |
| Ice apex `/api/static-contact-health` | 200 | application/json |
| Ice www `/` | 200 | text/html |
| Ice www `/contact` | 200 | text/html |
| Ice www `/service-areas` | 200 | text/html |
| Ice www `/api/static-contact-health` | 200 | application/json |
| Pumpkin API `/health` | 200 | application/json |
| Pumpkin API `/api/health` | 200 | application/json |
| Admin UI production `/` | 200 | text/html |
| Admin UI production `/login` | 200 | text/html |
| Admin UI production `/dashboard` | 200 | text/html |

Result: 13/13 passed.

No contact POST, form submission, customer-facing POST, or Airstrip route probe occurred.
