# Runtime No-Regression Proof

GET-only no-regression checks passed 14/14.

- Pumpkin API `/health`: HTTP 200.
- Pumpkin API `/api/health`: HTTP 200.
- Ice apex `/`: HTTP 200.
- Ice www `/`: HTTP 200.
- Ice apex `/contact`: HTTP 200.
- Ice www `/contact`: HTTP 200.
- Ice apex `/service-areas`: HTTP 200.
- Ice www `/service-areas`: HTTP 200.
- Ice apex `/api/static-contact-health`: HTTP 200.
- Ice www `/api/static-contact-health`: HTTP 200.
- Isolated Ice `/api/static-contact-health`: HTTP 200.
- Admin UI production `/`: HTTP 200.
- Admin UI production `/login`: HTTP 200.
- Admin UI production `/dashboard`: HTTP 200.

No contact POST occurred.

