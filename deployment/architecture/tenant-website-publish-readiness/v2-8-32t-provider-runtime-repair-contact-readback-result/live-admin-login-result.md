# Live Admin Login Result

Status: failed before bearer token issuance.

Login endpoint:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/auth/login`

Payload shape:

`{ email, password }`

Result:

- HTTP status: 401.
- Bearer token issued: no.
- Token printed or written: no.
- Password printed or written: no.

Interpretation:

The prior provider-store exception is cleared. Source returns 401 when the user is missing, inactive, or the BCrypt password does not match. V2.8.32T could not distinguish those cases without reading or mutating provider data directly, and no source-discovered Admin seed/repair route exists.

Classification: `admin_login_unauthorized_after_provider_binding`.

