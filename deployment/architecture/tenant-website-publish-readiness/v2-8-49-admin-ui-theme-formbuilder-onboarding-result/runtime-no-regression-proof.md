# Runtime No-Regression Proof

Result: passed.

Public site:

- `https://iceskatingrinkrentals.com/`: HTTP 200.
- `https://iceskatingrinkrentals.com/contact`: HTTP 200.
- `https://iceskatingrinkrentals.com/service-areas`: HTTP 200.
- `https://www.iceskatingrinkrentals.com/`: HTTP 200.
- `https://www.iceskatingrinkrentals.com/contact`: HTTP 200.
- `https://www.iceskatingrinkrentals.com/service-areas`: HTTP 200.

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
- `/dashboard/themes`: HTTP 200.
- `/dashboard/form-builder`: HTTP 200.

Admin UI isolated:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- `/dashboard`: HTTP 200.
- `/dashboard/themes`: HTTP 200.
- `/dashboard/form-builder`: HTTP 200.

No contact POST was sent.
