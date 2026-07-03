# Pumpkin API Test/Build/Deploy Result

Focused tests:

- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-58a-tenantadmin`: pass.

Builds:

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release`: pass.
- `dotnet build apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -c Release`: pass after serial rerun.

Publish/package:

- Appsettings excluded: pass.
- ZIP entry count: 56.
- Backslash entries: 0.
- Appsettings entries: 0.

Deploy:

- Pumpkin API deploy count: 1.
- Deployment ID: `b74e7431-d13c-4313-9781-a72ee76e16c0`.
- Deployment status: `RuntimeSuccessful`.

