# API Test Result

Passed:

`dotnet build apps/pumpkin-api/pumpkin-api.csproj`

Passed:

`dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-11-4`

The scoped runner verifies:

- all 8 route payload shapes;
- Ice candidate state;
- Roller paused/no-import/no-resume state;
- `readOnly: true`;
- provider mode;
- mutation route absence;
- no high-confidence secret-like response values;
- Google indexing deferred hard stop.
