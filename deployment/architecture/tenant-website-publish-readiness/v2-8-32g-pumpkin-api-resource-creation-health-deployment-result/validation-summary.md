# Validation Summary

Date: 2026-06-27

## Start-State Checks

| Check | Result |
| --- | --- |
| `git status --short` | Completed; worktree was already busy |
| V2.8.32C result package review | Passed |
| V2.8.32D result package review | Passed |
| V2.8.32E result package review | Passed |
| V2.8.32F result package review | Passed |

## Azure And Deployment Checks

| Check | Result |
| --- | --- |
| Operator env values | Read; target values present, some optional approval/env fields unset |
| Subscription set to expected id | Passed |
| `az account show` subscription lock | Passed |
| Artifact SHA-256 | Passed |
| Artifact blocked config entry scan | Passed |
| Linux runtime availability | Passed; `DOTNETCORE|10.0` available |
| Resource group show | Passed; exists and `Succeeded` |
| App Service plan show before create | `ResourceNotFound` |
| App Service plan create | Failed on East US Total VMs quota |
| App Service plan show after create attempt | `ResourceNotFound` |
| Web App show before plan attempt | `ResourceNotFound` |
| Web App create | Skipped after plan blocker |
| ZIP deploy | Skipped; Web App absent |
| Health GET checks | Skipped; deployment did not occur |

## File Validation

| Check | Result |
| --- | --- |
| JSON parse for `result-manifest.json` | Passed |
| `node --check` for changed JS/MJS | Skipped; no scoped JS/MJS files |
| Scoped `git diff --check` for V2.8.32G files | Passed |
| Full `git diff --check` | Passed; emitted CRLF warnings for pre-existing busy worktree files only |
| Required result-package file presence | Passed |
| Trailing whitespace scan for V2.8.32G files | Passed |
| Secret-like assignment scan for V2.8.32G files | Passed |
| Deploy-target URL scan | Passed after URL normalization |
| Approved target token scan | Completed |
| Protected/generated/raw path guard | Passed; scoped outputs are docs/json only |
| Forbidden appsettings/secrets command-line scan | Passed |
| Staged file check | Passed; no files staged |

Notes:

- An initial deploy-target URL scan included Markdown/JSON punctuation around approved URLs. It was rerun with URL normalization and passed.

## Boundary Validation

Confirmed for V2.8.32G:

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
