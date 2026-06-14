# API Test Result

Status: passed.

Commands:

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj`
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-11-4`

Results:

- API build passed with 0 warnings and 0 errors.
- V2.11.4 import-intake API read-only endpoint tests passed.
- The scoped runner verifies the endpoint mapper registers exactly eight GET routes and no POST/PUT/PATCH/DELETE routes in the import-intake surface.

No API runtime server was started.

