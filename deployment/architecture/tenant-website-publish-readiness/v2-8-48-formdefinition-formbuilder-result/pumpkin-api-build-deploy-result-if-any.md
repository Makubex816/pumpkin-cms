# Pumpkin API Build Deploy Result

Build and test:

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj`: passed.
- `dotnet build apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj`: passed after rerunning serially because the first parallel attempt hit a compiler file lock.
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-48-formdefinition`: passed.
- `dotnet publish apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore /p:ExcludeAppSettingsFromPublish=true`: passed.
- Publish artifact protected config scan: `0` protected config files.
- Zip entry validation: `56` entries, `0` backslash entries, `0` protected config entries.

Deploy:

- Pumpkin API deployed exactly once.
- Deployment status: `RuntimeSuccessful`.
- Successful instances: `1`.
- Failed instances: `0`.

No appsettings mutation occurred.
