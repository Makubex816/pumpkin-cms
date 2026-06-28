# V2.8.32W Carryforward

V2.8.32W resolved live Admin login HTTP 500 by setting only source-discovered non-secret JWT support settings:

- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`

V2.8.32W confirmed:

- Live Admin login returned HTTP 200.
- A bearer token was issued.
- Static contact preflights passed.
- No production contact POST was sent.

V2.8.32W blocker:

Authenticated Admin FormEntry readback returned HTTP 500 because Cosmos returned NotFound for the source-required `FormEntry` container.

V2.8.32X started from:

`admin_formentry_readback_container_not_found_after_login_repair`
