# V2.8.32Q Carryforward

V2.8.32Q used a corrected ignored secure file with a non-empty Admin JWT secret value.

Carryforward facts:

- Subscription lock passed for `ff887def-fd83-4a19-9298-13d4b1687873`.
- Only `Jwt__SecretKey` was set on the live Pumpkin API Web App.
- The Web App was restarted in Q.
- Pumpkin API health returned HTTP 200 after the Q restart.
- Static contact health/page preflights passed in Q.
- Live Admin login returned HTTP 500.
- No bearer token was issued.
- Admin readback preflight did not run.
- Zero production contact POSTs were sent.

R accepted the Q blocker `live_admin_login_failed_http_500` and narrowed it to `provider_store_access_failed`.

