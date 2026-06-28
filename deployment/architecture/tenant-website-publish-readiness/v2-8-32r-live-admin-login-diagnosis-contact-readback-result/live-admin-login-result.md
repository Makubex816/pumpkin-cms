# Live Admin Login Result

Status: failed before bearer token issuance.

Login endpoint: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/auth/login`.

Observed result from bounded diagnostic logs:

- HTTP status: 500.
- Bearer token issued: no.
- Sanitized exception: `System.ArgumentException: The connection string is missing a required property: AccountEndpoint`.

No additional login attempt was run after the provider-store blocker was identified. The returned bearer token was never available, so no token was printed, written, or used.

Classification: `provider_store_access_failed`.

