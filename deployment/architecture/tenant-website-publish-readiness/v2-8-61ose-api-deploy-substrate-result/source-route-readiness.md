# Source Route Readiness

Source changes were present and scoped to the submit-key route and database contract.

Key source files:

| Path | Purpose |
| --- | --- |
| `apps/pumpkin-api/Program.cs` | Adds `POST /api/admin/tenants/{tenantId}/submit-key` |
| `apps/pumpkin-api/Services/TenantSubmitKeyProvisioning.cs` | Validates SuperAdmin role, hashes submit key, returns sanitized response |
| `apps/pumpkin-api/Services/IDatabaseService.cs` | Adds hash provisioning contract |
| `apps/pumpkin-api/Services/IDataConnection.cs` | Adds data connection contract |
| `apps/pumpkin-api/Services/DatabaseService.cs` | Delegates provisioning operation |
| `apps/pumpkin-api/Services/CosmosDataConnection.cs` | Stores only hash for existing tenant |
| `apps/pumpkin-api/Services/MongoDataConnection.cs` | Maintains provider parity |
| `apps/pumpkin-api.Tests/TenantSubmitKeyProvisioningSourceTestRunner.cs` | Focused source test |

Focused test result:

`dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-61osd-submit-key`

Result: passed.

API build result:

`dotnet build apps/pumpkin-api/pumpkin-api.csproj`

Result: passed.

