# Admin Identity Source Analysis

Source files inspected:

- `apps/pumpkin-net-models/Models/User.cs`
- `apps/pumpkin-api/Services/CosmosSystemTextJsonSerializer.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/Program.cs`

Discovered identity schema:

| Purpose | Source field |
| --- | --- |
| Cosmos container | `User` |
| ID | `id` |
| Tenant scope / partition key value | `tenantId` |
| Email lookup | `email` |
| Username | `username` |
| Password hash | `passwordHash` |
| Active status | `isActive` |
| Created timestamp | `createdDate` |
| Last login timestamp | `lastLogin` |
| Role | `role` |
| Permissions | `permissions` |

Serializer behavior:

- Cosmos serializer uses `System.Text.Json`.
- Property naming policy is camelCase.
- `UserRole` has no JSON string enum converter in the inspected serializer, so source-compatible role storage is numeric.

Login behavior:

- Source reads from `_database.GetContainer("User")`.
- Source query is `SELECT * FROM c WHERE c.email = @email`.
- Login returns HTTP 401 if the user is missing or inactive.
- Login returns HTTP 401 if `BCrypt.Net.BCrypt.Verify` fails.
- Login issues a JWT only after those checks pass.

Repair defaults selected from source:

- Role: `TenantAdmin` numeric value `1`.
- Permissions: TenantAdmin defaults from the test-side source generator, including `forms:read`.
- Password hashing: `BCrypt.Net.BCrypt.HashPassword`.

Container naming note:

`ProviderMetadataService` lists lower-case metadata names such as `users`, but the actual login source hardcodes `User`. V2.8.32U did not guess or mutate a lower-case container.

