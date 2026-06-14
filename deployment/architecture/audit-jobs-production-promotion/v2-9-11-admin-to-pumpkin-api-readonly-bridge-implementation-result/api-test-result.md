# API Test Result

Commands:

- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-9-9`
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj --no-restore`

Results:

- V2.9.9 Audit Jobs API read-only endpoint tests: passed;
- API build: passed with 0 warnings and 0 errors.

The V2.9.11 Admin bridge did not add or alter the Audit Jobs API route family. The only API runtime source change is scoped lazy database-service resolution in `TenantCorsPolicyProvider`.
