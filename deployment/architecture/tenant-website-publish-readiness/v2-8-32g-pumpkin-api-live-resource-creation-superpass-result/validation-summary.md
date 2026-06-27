# Validation Summary

Date: 2026-06-27

## Start-State Checks

| Check | Result |
| --- | --- |
| `git status --short` | Completed; worktree was already busy |
| V2.8.32C result review | Passed |
| V2.8.32D result review | Passed |
| V2.8.32E result review | Passed |
| V2.8.32F result review | Passed |

## Azure And Deployment Checks

| Check | Result |
| --- | --- |
| Operator env values | Read; most fallback env values unset, task fallback policy used |
| Subscription lock | Passed |
| Artifact SHA-256 | Passed |
| Artifact blocked config entry scan | Passed |
| Linux runtime availability | Passed |
| Existing App Service plan list | No suitable Linux Pumpkin API plan found |
| Existing Web App list | Empty |
| Primary East US group | Confirmed |
| Primary East US plan attempt | Quota blocked |
| East US 2 fallback group | Created |
| East US 2 fallback plan attempts | `B1`, `S1`, and `P0V3` quota blocked |
| Central US fallback group | Created |
| Central US fallback plan | Created |
| Central US Web App | Created |
| ZIP deploy | Attempted once, failed server-side HTTP `400` |
| Health GET checks | Skipped because deployment failed |

## File Validation

| Check | Result |
| --- | --- |
| JSON parse for `result-manifest.json` | Passed |
| `node --check` for changed JS/MJS | Skipped; no scoped JS/MJS files |
| Scoped `git diff --check` for V2.8.32G Superpass files | Passed |
| Full `git diff --check` | Passed; emitted CRLF warnings for pre-existing busy worktree files only |
| Required result-package file presence | Passed |
| Trailing whitespace scan for V2.8.32G Superpass files | Passed |
| Secret-like assignment scan for V2.8.32G Superpass files | Passed |
| Deploy-target URL scan | Passed |
| Protected/generated/raw path guard | Passed; scoped outputs are docs/json only |
| Forbidden appsettings/secrets command-line scan | Passed |
| Staged file check | Passed; no files staged |

## Boundary Validation

Confirmed for V2.8.32G Superpass:

- No contact POST occurred.
- No production API write occurred.
- No FormEntry write/read validation occurred.
- No Admin live API read validation occurred.
- No provider protected binding occurred.
- No app settings were listed, shown, or set.
- No protected config was read.
- No `.env.local`, appsettings, or local.settings content was read.
- No Key Vault secret query occurred.
- No keys/listKeys occurred.
- No connection string or SAS generation occurred.
- No DNS/custom-domain mutation occurred.
- No Search Console/indexing action occurred.
- No arbitrary outbound URL checks occurred.
- No files were staged.
