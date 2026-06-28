# Login Source Analysis

Relevant source files inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-net-models/Models/User.cs`
- `apps/pumpkin-api/PRODUCTION-CONFIG-REFERENCE.md`

Login path:

- `/api/auth/login` reads the user by email from the `User` container.
- Inactive or missing users return HTTP 401.
- Password verification uses `BCrypt.Net.BCrypt.Verify`.
- After password verification, login builds a JWT.

JWT requirements discovered from source:

- `Jwt__SecretKey`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`

The V2.8.32W source-backed 500 candidate was `Jwt__ExpirationMinutes`, because `Program.cs` parses it directly before returning a token. Prior redacted evidence from V2.8.32T showed `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes` were absent.

Production config reference values used for the non-secret repair:

- `Jwt__Issuer`: source-documented default issuer.
- `Jwt__Audience`: source-documented default audience.
- `Jwt__ExpirationMinutes`: source-documented production value.
