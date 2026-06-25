# Validation Summary

Validation run:

| Check | Result |
| --- | --- |
| `git status --short` | pass, busy worktree recorded |
| `git log --oneline -15` | pass |
| `git diff --cached --name-only` | pass, no staged files at start |
| Static function `npm run check` | pass |
| Static function `npm test` | pass |
| Ice `npm run type-check` | pass |
| Ice `npm run validate:static:ice` | pass with 34 existing warnings |
| Ice `npm run build:static:ice:sanitized` | pass |
| Sanitized build protected config copied | false |
| Contact artifact endpoint verification | pass |
| API-aware isolated readiness wrapper | pass |
| SWA CLI version | `2.0.9` |
| Isolated deployment | pass, exactly one attempt |
| Isolated `/contact` GET | pass, HTTP 200 |
| Isolated contact POST | sent exactly once, failed HTTP 404 empty body |

Strict validators:

- Static output validator: static form gate passed, but local static integrity failed on 165 known media-origin policy findings.
- Staging package validator: static form gate passed, but local package integrity failed on the same 165 known media-origin policy findings.

Final validation completed:

| Check | Result |
| --- | --- |
| JSON parse for `result-manifest.json` | pass |
| `node --check` for changed JS/MJS files | pass |
| `git diff --check` | pass, line-ending warnings only |
| Scoped trailing whitespace scan | pass |
| High-confidence secret-like value scan | pass |
| Command-shaped production deploy-target scan | pass |
| Protected/generated/raw scoped path guard | pass |
| Final staged-file check | pass, no files staged |

The first secret scan flagged the validators' own literal detection regex for storage connection strings. A value-shaped rerun found no secret-like values.

The first deploy-target scan flagged planning prose. A command-shaped rerun found no production deployment command.
