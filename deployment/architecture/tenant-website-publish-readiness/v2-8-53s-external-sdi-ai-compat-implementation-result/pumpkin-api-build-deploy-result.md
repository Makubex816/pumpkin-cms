# Pumpkin API Build Deploy Result

Build and source checks passed before deploy:

| Command | Result |
| --- | --- |
| `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-53s-external-compat` | pass |
| `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-32c` | pass |
| `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-48-formdefinition` | pass |
| `dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release` | pass, 0 warnings, 0 errors |

Publish/deploy result:

| Item | Result |
| --- | --- |
| Publish output | succeeded |
| Appsettings/local settings excluded | yes |
| ZIP entries | 56 |
| ZIP entry names | POSIX-style |
| Pumpkin API deploy count | exactly 1 |
| Target Web App | `app-pumpkin-api-prod-centralus-001` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Deploy result | succeeded |

No appsettings mutation occurred.
