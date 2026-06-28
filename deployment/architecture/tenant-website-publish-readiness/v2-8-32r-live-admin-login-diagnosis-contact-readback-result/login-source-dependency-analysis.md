# Login Source Dependency Analysis

Relevant source path:

- `apps/pumpkin-api/Program.cs:388` maps `POST /api/auth/login`.
- `apps/pumpkin-api/Program.cs:391` calls `databaseService.GetUserByEmailAsync(request.Email)`.
- `apps/pumpkin-api/Program.cs:398` verifies the stored password hash with BCrypt.
- `apps/pumpkin-api/Program.cs:407-423` builds the JWT and parses `Jwt:ExpirationMinutes`.
- `apps/pumpkin-api/Program.cs:426-427` emits JWT issuer and audience.

JWT support settings discovered from source:

- `Jwt__SecretKey`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`

Store dependency discovered from source:

- `apps/pumpkin-api/Services/DatabaseService.cs:25-30` routes configured provider `CosmosDb` to `CosmosDataConnection`.
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:40` constructs `CosmosClient` from the configured Cosmos connection string.
- `apps/pumpkin-api/Services/CosmosDataConnection.cs:1877-1887` reads the `User` container during login.
- `apps/pumpkin-api/Services/DatabaseSettings.cs:25-28` defines the Cosmos connection string and database name settings.

Conclusion:

The live 500 happens before JWT generation can be proven as the active failure. Logs show the login path is failing in the provider/store layer with a malformed or missing Cosmos connection string property.

