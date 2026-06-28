# V2.8.32N Carryforward

V2.8.32N used the operator-created ignored auth file at `.tmp/v2-8-32n/secure/formentry-readback-auth.json`.

Carryforward facts:

- The file existed and was git-ignored.
- Mode was `custom-header`.
- Header name was `Authorization`.
- Header value was present but not printed or written.
- Approved health/page preflights passed.
- Contact page serialized `/api/static-contact`, did not serialize `/api/contact`, and contained `contact@iceskatingrinkrentals.com`.
- Authenticated Admin FormEntry preflight returned HTTP `401`.
- Production contact POST count used was `0`.
- Contact gate remained open.

V2.8.32N exact blocker: `readback_auth_invalid_or_insufficient`.

V2.8.32O therefore needed to bind live Admin/JWT auth correctly, log in to the live Pumpkin API, and run the POST/readback gate only after authenticated readback preflight returned 2xx.

