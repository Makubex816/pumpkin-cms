# Provider Config Source Analysis

Source files inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/DatabaseSettings.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-net-models/Models/User.cs`

Provider settings:

- `Program.cs` binds `DatabaseSettings` from section `Database`.
- `Program.cs` binds `CosmosDbSettings` from section `Database:CosmosDb`.
- `DatabaseSettings.Provider` defaults to `CosmosDb`.
- `CosmosDbSettings.ConnectionString` maps to `Database__CosmosDb__ConnectionString`.
- `CosmosDbSettings.DatabaseName` maps to `Database__CosmosDb__DatabaseName`.
- `CosmosDataConnection` constructs `CosmosClient` from the Cosmos connection string and gets the database by database name.

Container behavior:

- Form entries use `_database.GetContainer("FormEntry")`.
- Users use `_database.GetContainer("User")`.
- No source-discovered setting exists for the FormEntry container name.

Health behavior:

- `Program.cs` returns dependency-light health for `/health` and `/api/health`.
- The response sets `providerConfigured = false` as a literal.
- The response sets `providerStatus = "not_checked"` as a literal.
- Therefore V2.8.32S health did not prove the provider binding was inactive.

Login behavior:

- `POST /api/auth/login` calls `GetUserByEmailAsync`.
- If the user is null or inactive, login returns HTTP 401.
- If BCrypt password verification fails, login returns HTTP 401.
- JWT generation occurs only after those checks pass.

Latent JWT support risk:

- Redacted appsetting presence showed `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes` are absent.
- The approved V2.8.32T secure file did not provide values for those settings.
- Login did not reach JWT generation because it returned HTTP 401 first.

