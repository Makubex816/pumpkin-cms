# SuperAdmin Source Model Review

Source-reviewed files:

- `apps/pumpkin-net-models/Models/User.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/CosmosSystemTextJsonSerializer.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api.Tests/Program.cs`

Findings:

- User container: `User`.
- Partition key path: `/tenantId`.
- Source-compatible partition value: `tenantId`.
- Email lookup: `SELECT * FROM c WHERE c.email = @email`.
- Password verification: BCrypt.
- Password hash generation: BCrypt.
- `UserRole.SuperAdmin` numeric value: `0`.
- Login emits role claim `SuperAdmin` and tenant claim from the user document.
- No source-supported user creation/listing route exists.

Decision:

- Use the approved direct Cosmos helper because no source-supported SuperAdmin creation route exists and the model was discovered.
