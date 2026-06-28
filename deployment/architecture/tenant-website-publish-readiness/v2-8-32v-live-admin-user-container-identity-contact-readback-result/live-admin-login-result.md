# Live Admin Login Result

Status: failed after identity repair.

Endpoint:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/auth/login`

Payload shape:

`{ email, password }`

Result:

- HTTP status: 500.
- Bearer token issued: no.
- Password printed or written: no.
- Token printed or written: no.

Interpretation:

The earlier HTTP 401 blocker was cleared by the identity repair. Login now reaches a later failure. Source shows the next step after password verification is JWT token generation, including `int.Parse(jwtSettings["ExpirationMinutes"]!)`. V2.8.32T had already shown `Jwt__ExpirationMinutes`, `Jwt__Issuer`, and `Jwt__Audience` were absent by redacted appsetting check.

Classification: `admin_login_failed_http_500_after_identity_repair`.

