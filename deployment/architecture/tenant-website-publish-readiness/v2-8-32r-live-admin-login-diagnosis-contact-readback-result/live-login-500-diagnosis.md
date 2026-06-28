# Live Login 500 Diagnosis

Diagnosis source: bounded App Service logs downloaded to ignored `.tmp/v2-8-32r/logs/`.

Sanitized evidence:

- `POST /api/auth/login` executed on 2026-06-28 UTC.
- The request returned HTTP 500.
- The application logged an unhandled exception.
- Exception type/message: `System.ArgumentException: The connection string is missing a required property: AccountEndpoint`.

This points to the data provider path, not to an Admin password mismatch:

- A missing or inactive user would return HTTP 401 by source.
- A BCrypt password mismatch would return HTTP 401 by source.
- The observed exception occurs while the application is trying to use provider configuration for the login user lookup.

This also means the approved JWT support setting repair was not the right repair to run in R. No `Jwt__Issuer`, `Jwt__Audience`, or `Jwt__ExpirationMinutes` mutation was performed.

Final diagnosis: `provider_store_access_failed`.

