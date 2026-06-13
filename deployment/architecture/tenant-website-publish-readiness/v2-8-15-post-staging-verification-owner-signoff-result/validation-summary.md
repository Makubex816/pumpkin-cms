# Validation Summary

| Validation | Result |
| --- | --- |
| `git status --short` | reviewed; busy worktree |
| `git diff --cached --name-only` | no staged files |
| V2.8.14C evidence review | passed |
| Azure read-only target show | passed |
| Azure read-only hostname list | passed, `[]` |
| Bounded route checks | passed, 3 routes `200 OK` |
| Artifact metadata check | passed, hash matched V2.8.14C |
| `npm run validate:static:ice` | passed with 34 existing warnings |
| `npm run type-check` | passed |
| Static output validator | passed |
| Staging package validator | passed |
| Runtime QA check | passed, 6 tests |
| Runtime QA evidence run | passed, `runtimeqa_9eec1c74e9e0890b` |
| Runtime QA evidence validation | passed with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM publish gate/provider profile | passed, 132 tests |
| Static form endpoint check | passed |
| Static form endpoint tests | passed, 28 checks |
| `result-manifest.json` parse | passed |
| bounded route result validation | passed |
| required result package files | passed, 21 of 21 present |
| `git diff --check` on touched paths | passed; line-ending normalization warnings only |
| high-confidence secret-like scan on checked docs/package | passed, 0 matches |
| generated output diff check | passed, no tracked diff |
| generated output ignore check | passed |
| final staged-file check | passed, no staged files |

No redeployment or deployment command was run in V2.8.15. Generated `.tmp`, `.static-artifacts`, Runtime QA, Resource Registry, and OLM evidence remains ignored and unstaged.
