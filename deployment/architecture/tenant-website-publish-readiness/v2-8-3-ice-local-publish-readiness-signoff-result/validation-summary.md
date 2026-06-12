# Validation Summary

| Validation | Result |
| --- | --- |
| Start-state status/log/cached diff | reviewed; no staged files |
| V2.8.1/V2.8.2 evidence review | complete |
| Route-source scan | passed after fallback/source metadata reconciliation |
| `npm run validate` | passed |
| `npm run validate:static:ice` | passed, 34 warnings |
| `npm run validate:static:roller` | passed, 31 warnings; paused tenant |
| `npm run type-check` | passed |
| `npm run build:static:ice` | passed with warnings and `.env.local` auto-detection caveat |
| Static publish generation | passed after explicit static profile rerun |
| Static output validator | passed, 42 files, 0 errors, 0 warnings |
| Staging package validator | passed, 42 files, 0 errors, 0 warnings |
| Runtime QA check suite | passed, 6 tests |
| Runtime QA evidence | passed, `runtimeqa_f1d3f440a58144b4` |
| Runtime QA evidence validation | passed with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM provider profile check | passed, live writes not allowed |
| Bounded secret-shaped scan | passed |
| Source-only no-uncontrolled-write scan | passed, no matches |
| `git diff --check` on touched tracked paths | passed; line-ending warnings only |
| Required package files | passed, 25 present |
| Generated artifact ignore guard | passed |
| Staged-file guard | passed, no files staged |

Generated `.tmp`, `.next`, `out`, and `.static-artifacts` artifacts remain excluded from commit scope.
