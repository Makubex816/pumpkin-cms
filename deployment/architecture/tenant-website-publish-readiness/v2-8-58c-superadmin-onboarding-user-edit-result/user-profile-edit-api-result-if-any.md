# User Profile Edit API Result

Result: implemented and deployed.

Routes:

- `GET /api/admin/users`
- `PATCH /api/admin/users/{tenantId}/{userId}`

Editable fields:

- `email`
- `firstName`
- `lastName`

Non-editable fields:

- `role`
- `tenantId`
- `password`
- `passwordHash`
- `apiKey`
- `token`
- `isActive`

Source files:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/UserProfileManagement.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`

Live proof:

- SuperAdmin `GET /api/admin/users`: HTTP 200.
- Returned user count: 3.
- Secret-like response fields detected: false.
- TenantAdmin `GET /api/admin/users`: HTTP 403.

