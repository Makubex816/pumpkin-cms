# Test Result

Commands run:

```powershell
dotnet build apps/pumpkin-api/pumpkin-api.csproj --no-restore /p:UseSharedCompilation=false
dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj --no-restore /p:UseSharedCompilation=false -- --phase-2h9
```

Results:

| Check | Result |
| --- | --- |
| API build | passed |
| Phase 2H-9 test runner | passed |
| List links envelope | passed |
| Link detail with instances | passed |
| Instances endpoint behavior | passed |
| Policies endpoint behavior | passed |
| Scan runs endpoint behavior | passed |
| Audit logs endpoint behavior | passed |
| Dashboard summary behavior | passed |
| Domain filter | passed |
| Pagination metadata | passed |
| Tenant guard denial | passed |
| Viewer read-only access | passed |
| Endpoint handler response envelope | passed |
| Write route absence scan | passed |

The test runner does not start a live API server, does not read protected config, and does not call live services.

