# Admin Identity Source Reconfirmation

Source files inspected:

- `apps/pumpkin-net-models/Models/User.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/Program.cs`

Reconfirmed:

- Container: `User`.
- Partition key path: `/tenantId`.
- Partition key value: tenant ID.
- Lookup: `SELECT * FROM c WHERE c.email = @email`.
- Required login fields: `email`, `passwordHash`, `isActive`, `tenantId`, `role`.
- Password verification: `BCrypt.Net.BCrypt.Verify`.
- Password hash generation: `BCrypt.Net.BCrypt.HashPassword`.
- TenantAdmin role numeric value: `1`.
- TenantAdmin default permissions include `forms:read`.

Login source note:

After credential verification, `Program.cs` parses `Jwt:ExpirationMinutes` and uses `Jwt:Issuer` / `Jwt:Audience` to issue a token.

