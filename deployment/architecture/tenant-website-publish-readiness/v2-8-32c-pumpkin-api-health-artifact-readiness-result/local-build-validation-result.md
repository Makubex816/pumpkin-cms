# Local Build Validation Result

## Commands

```powershell
dotnet build apps/pumpkin-api/pumpkin-api.csproj
dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release
```

## Result

- Initial default Debug build did not complete because an already-running local `pumpkin-api` process, PID `127068`, held `apps/pumpkin-api/bin/Debug/net10.0/pumpkin-net-models.dll`.
- No source compile error was reported by that attempt.
- The running process was not stopped or mutated.
- Release build passed with 0 warnings and 0 errors.

## Release Build Output

```text
Build succeeded.
0 Warning(s)
0 Error(s)
```
