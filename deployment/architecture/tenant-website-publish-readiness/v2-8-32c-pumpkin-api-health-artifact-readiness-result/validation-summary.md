# Validation Summary

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | Worktree busy at start; scoped files identified. |
| `dotnet --info` | Passed; SDK/runtime facts recorded. |
| `dotnet build apps/pumpkin-api/pumpkin-api.csproj` | Blocked by pre-existing running Debug process lock, not source failure. |
| `dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release` | Passed, 0 warnings, 0 errors. |
| `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -c Release -- --v2-8-32c` | Passed. |
| `dotnet publish apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore -o .tmp/v2-8-32c/pumpkin-api-publish /p:ExcludeAppSettingsFromPublish=true` | Passed. |
| Publish manifest/hash generation | Passed; 56 files, zero blocked config files. |
| `git check-ignore` for `.tmp/v2-8-32c` artifact files | Passed; `.gitignore:35:.tmp/` applies. |

## Additional Guards

- JSON parse passed for `result-manifest.json` and `.tmp/v2-8-32c/publish-manifest.json`.
- Node syntax check was not applicable; no changed/new JS or MJS files in V2.8.32C scope.
- `git diff --check` passed for V2.8.32C scoped tracked paths.
- Trailing whitespace scan passed for V2.8.32C scoped files.
- Secret-like scan found no live secret values. It surfaced one pre-existing placeholder string in the legacy test utility: `CHANGE-ME-BEFORE-PRODUCTION`.
- Deploy/mutation/protected-path scan surfaced expected source route definitions, setting names without values, future-only command plan text, and boundary confirmations.
- Publish artifact blocked-config scan returned no `appsettings*.json`, `local.settings*.json`, or `.env*` files.
- `git diff --cached --name-only` returned no staged files.

## Result

V2.8.32C local source and artifact readiness is complete. Deployment, protected binding, live health, contact write, and Admin readback remain deferred.
