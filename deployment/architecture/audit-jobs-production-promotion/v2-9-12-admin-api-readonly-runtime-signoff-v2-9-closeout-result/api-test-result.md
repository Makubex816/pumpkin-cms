# API Test Result

Status: passed.

Commands:

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj --no-restore`
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-9-9`

Results:

- API build passed with 0 warnings and 0 errors.
- V2.9.9 scoped API test runner passed on isolated rerun.
- The first parallel test attempt hit a transient compiler output file lock while the build was running concurrently; the isolated rerun passed and is the accepted result.

Covered by the scoped API test runner:

- read-only envelope shape;
- provider mode `api-local-fixture-readonly`;
- expected fixture counts;
- tenant/site auth checks;
- no-write boundary fields;
- source guards rejecting Audit Jobs write route registrations.
