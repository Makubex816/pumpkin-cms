# Pumpkin API Source Readiness

## Source Files Inspected

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/pumpkin-api.csproj`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`
- Source-only service contracts needed to identify configuration names and FormEntry methods.

Protected config files were not opened.

## Readiness Result

- Pumpkin API remains an ASP.NET Core Web SDK project targeting `net10.0`.
- Health routes are present and dependency-light.
- FormEntry write route exists.
- Admin FormEntry list route exists.
- A scoped test runner verifies the V2.8.32C route/source contract.
- Local publish can produce an artifact with appsettings files excluded by explicit MSBuild property.

## Source Edits

- `.gitignore`: added `.tmp/` so local artifacts are ignored.
- `apps/pumpkin-api/Program.cs`: added `GetHealth`, `GET /api/health`, and `GET /health`.
- `apps/pumpkin-api/pumpkin-api.csproj`: added opt-in `ExcludeAppSettingsFromPublish` publish guard.
- `apps/pumpkin-api.Tests/Program.cs`: added `--v2-8-32c` scoped runner dispatch.
- `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`: added source readiness assertions.
