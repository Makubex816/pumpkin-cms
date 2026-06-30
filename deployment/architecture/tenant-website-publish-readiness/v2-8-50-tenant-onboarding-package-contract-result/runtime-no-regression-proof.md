# Runtime No-Regression Proof

Result: passed.

Public site:

- Apex `/`: HTTP 200.
- Apex `/contact`: HTTP 200.
- Apex `/service-areas`: HTTP 200.
- WWW `/`: HTTP 200.
- WWW `/contact`: HTTP 200.
- WWW `/service-areas`: HTTP 200.

Static contact health:

- Apex `/api/static-contact-health`: HTTP 200.
- WWW `/api/static-contact-health`: HTTP 200.
- Isolated `/api/static-contact-health`: HTTP 200.

Pumpkin API:

- `/health`: HTTP 200.
- `/api/health`: HTTP 200.

Admin UI production:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- `/dashboard`: HTTP 200.

No contact POST occurred.
