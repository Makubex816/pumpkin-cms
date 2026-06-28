# Contact Page Endpoint Verification

Contact page URL: `https://iceskatingrinkrentals.com/contact`

Started UTC: `2026-06-28T01:37:13.4668874Z`

Result:

- HTTP status: `200`.
- Page serialized `/api/static-contact`: yes.
- Page serialized legacy `/api/contact`: no.
- Page contained expected public email `contact@iceskatingrinkrentals.com`: yes.
- Content length observed: `70687`.

Fallback impact:

- `frontend_endpoint_mismatch`: no.
