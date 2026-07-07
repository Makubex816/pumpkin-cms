# Runtime No-Regression Proof

Status: passed.

Method: GET-only with `curl.exe`.

Summary: 17/17 checks returned HTTP 200.

Covered:

- Ice apex and www `/`, `/contact`, `/service-areas`, and `/api/static-contact-health`.
- Pumpkin API `/health` and `/api/health`.
- Admin UI production `/`, `/login`, and `/dashboard`.
- Airstrip production default host `/`, `/request-booking`, `/packages`, and `/airstrip-the-club`.

No contact POST, form submission, or customer-facing POST was sent.
