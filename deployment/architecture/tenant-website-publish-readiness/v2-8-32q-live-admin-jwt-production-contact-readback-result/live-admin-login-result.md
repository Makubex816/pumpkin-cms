# Live Admin Login Result

Login endpoint:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/auth/login`

Login payload shape:

`{ email, password }`

Result:

- Login attempted: yes.
- HTTP status: `500`.
- OK: no.
- Token present: no.
- Response body length: `0`.

Secret handling:

- Admin email was used in memory.
- Admin password was used in memory.
- Admin password was not printed or written.
- No token or cookie was returned, printed, or written.

Fallback classification: `live_admin_login_failed_http_500`.

