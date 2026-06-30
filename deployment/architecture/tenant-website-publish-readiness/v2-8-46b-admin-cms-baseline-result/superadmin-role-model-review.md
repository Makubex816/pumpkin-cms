# SuperAdmin Role Model Review

Source-reviewed files:

- `apps/pumpkin-net-models/Models/User.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`

Findings:

- `UserRole.SuperAdmin` is enum value `0`.
- `UserRole.TenantAdmin` is enum value `1`.
- Admin routes enforce route/JWT tenant equality unless the caller role is `SuperAdmin`.
- Login uses `BCrypt.Net.BCrypt.Verify`.
- The active source exposes login/verify and tenant-scoped admin content routes.

No source-supported live route for creating or listing users was discovered. Existing user lookup is internal to login/verify flow.
