# Validation Summary

Date: 2026-06-27

## Local Carryforward Validation

Command:

```powershell
dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -c Release -- --v2-8-32c
```

Result:

```text
V2.8.32C Pumpkin API health and route readiness checks passed.
```

## File Validation

| Check | Result |
| --- | --- |
| JSON parse for `result-manifest.json` | Passed |
| `node --check` for changed/new JS/MJS | Skipped; no V2.8.32D JS/MJS files |
| `git diff --check` | Passed; emitted line-ending warnings for pre-existing busy worktree files only |
| Trailing whitespace scan for V2.8.32D files | Passed |
| Secret-like assignment / connection material scan for V2.8.32D files | Passed |
| Deploy-target scan for V2.8.32D files | Passed; only approved Pumpkin API base/health URLs found |
| Protected/generated/raw path guard for V2.8.32D files | Passed; docs/json only |
| Staged file check | Passed; no files staged |

Notes:

- An initial `node --check` validation command used an overly broad file filter and tried to check Markdown. It was rerun with a strict `.js`/`.mjs` filter and correctly skipped because no scoped JS/MJS files exist.
- An initial deploy-target scan included JSON punctuation in a URL match. It was rerun with normalized URL parsing and passed.

## Azure Boundary Validation

Confirmed from the executed command set:

- Resource group create occurred only for `rg-pumpkin-api-prod-eastus`.
- App Service plan create was attempted only for `asp-pumpkin-api-prod-eastus-001` and failed on Azure quota.
- Web App create was not attempted after the plan blocker.
- ZIP deploy was not attempted.
- Live health GET checks were not attempted.
- No contact POST occurred.
- No protected config read occurred.
- No app-setting secret binding occurred.
- No DNS/custom-domain mutation occurred.
- No Search Console/indexing action occurred.
- No deployment token action occurred.
- No keys/listKeys, connection string generation, or SAS generation occurred.

