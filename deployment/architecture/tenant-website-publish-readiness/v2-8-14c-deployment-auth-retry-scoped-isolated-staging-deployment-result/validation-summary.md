# Validation Summary

| Validation | Result |
| --- | --- |
| `git status --short` | reviewed; busy worktree |
| `git diff --cached --name-only` | no staged files |
| PowerShell token presence | passed, boolean-only |
| Node token presence | passed, boolean-only |
| `npx --yes @azure/static-web-apps-cli@2.0.9 --version` | `2.0.9` |
| `az account show --output json` | passed |
| isolated SWA target show | passed |
| isolated SWA hostname list | passed, `[]` |
| `npm run build:static:ice:sanitized` | passed |
| `npm run validate:static:ice` | passed with 34 existing warnings |
| `npm run type-check` | passed |
| direct `node scripts/static-publish.mjs generate` without env | failed missing site key, non-mutating |
| Ice env static generate | passed with 34 existing warnings |
| static output validator | passed |
| staging package validator | passed |
| readiness wrapper | passed |
| artifact root/security scan | passed |
| Runtime QA check | passed, 6 tests |
| Runtime QA evidence run | passed, `runtimeqa_678e9af915877817` |
| Runtime QA evidence validation | passed with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM local/provider profile check | passed, 132 tests |
| static form endpoint check | passed |
| static form endpoint tests | passed, 28 checks |
| scoped isolated staging deployment | passed, 1 attempt |
| bounded route checks | passed, 3 routes `200 OK` |
| `result-manifest.json` parse | passed |
| required result package file presence | passed, 23 of 23 present |
| `git diff --check` on touched paths | passed; line-ending normalization warnings only |
| token value scan on checked docs/package | passed, 0 occurrences |
| high-confidence secret-like scan on checked docs/package | passed, 0 matches |
| generated output diff check | passed, no tracked diff |
| generated output ignore check | passed |
| final staged-file check | passed, no staged files |

Generated `.tmp`, `.static-artifacts`, Runtime QA, Resource Registry, and OLM evidence remains ignored and unstaged.
