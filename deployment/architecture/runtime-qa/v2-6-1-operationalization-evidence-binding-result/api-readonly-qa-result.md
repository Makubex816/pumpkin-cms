# API Read-only QA Result

Status: passed.

Command:

```powershell
dotnet run --project apps\pumpkin-api.Tests\pumpkin-api.Tests.csproj -- --phase-2h9
```

Result:

- Phase 2H-9 Outbound Link Manager API read-only tests: `passed`

Note: the first parallel run hit a local `obj` write race while another dotnet test was building. A single rerun passed without source or config changes.
