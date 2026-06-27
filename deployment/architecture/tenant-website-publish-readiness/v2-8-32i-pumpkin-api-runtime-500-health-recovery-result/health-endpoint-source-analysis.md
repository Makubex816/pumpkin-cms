# Health Endpoint Source Analysis

Health routes:

- `GET /health`
- `GET /api/health`

The health handler remains dependency-light:

- Returns `ok = true`
- Identifies `service = "pumpkin-api"`
- Returns `providerConfigured = false`
- Returns `providerStatus = "not_checked"`
- Does not depend on `IDatabaseService`
- Does not read provider config
- Does not read connection strings
- Does not read appsettings/local settings
- Does not require FormEntry storage
- Does not require Admin API readback
- Does not require contact/provider secrets

I added explicit `.AllowAnonymous()` to both health routes and extended the scoped health readiness runner to assert the anonymous/dependency-light contract.
