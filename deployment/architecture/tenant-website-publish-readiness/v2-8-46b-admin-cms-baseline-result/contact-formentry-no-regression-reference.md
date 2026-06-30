# Contact And FormEntry No-Regression Reference

No contact POST was sent.

GET-only contact runtime proof:

- Apex `/contact`: HTTP 200.
- WWW `/contact`: HTTP 200.
- Apex `/api/static-contact-health`: HTTP 200.
- WWW `/api/static-contact-health`: HTTP 200.
- Isolated `/api/static-contact-health`: HTTP 200.

Content proof:

- Public `/contact` contains `contact@iceskatingrinkrentals.com`.
- Public `/contact` does not contain `hello@iceskatingrinkrentals.com`.

Authenticated FormEntry readback:

- `GET /api/admin/ice-rink-rentals/form-entries`: HTTP 200.
- Count: `4`.
- No FormEntry write or status change occurred.
