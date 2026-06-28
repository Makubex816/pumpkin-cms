# V2.8.32L Carryforward

V2.8.32L stopped before production POST because Admin FormEntry readback auth was missing.

V2.8.32L established:

- Pumpkin API `/health` passed.
- Pumpkin API `/api/health` passed.
- Static contact health passed.
- Contact page returned HTTP `200`.
- Contact page serialized `/api/static-contact`.
- Contact page did not serialize legacy `/api/contact`.
- Contact page contained expected public email `contact@iceskatingrinkrentals.com`.
- Admin FormEntry readback returned HTTP `401` without approved auth.
- Production contact POST count was `0`.
- Exact blocker was `readback_auth_missing`.

V2.8.32M carryforward:

- Auth mode is now `custom-header`.
- Required custom-header env values are still missing in the visible runtime environment.
- The new exact blocker is `readback_custom_header_env_missing`.
- No production POST was sent.
