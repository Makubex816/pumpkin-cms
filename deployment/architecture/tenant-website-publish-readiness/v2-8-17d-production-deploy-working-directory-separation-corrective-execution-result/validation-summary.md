# Validation Summary

V2.8.17D validation results:

| Validation | Result |
| --- | --- |
| V2.8.17C carryforward review | passed |
| PowerShell token presence boolean check | `true` |
| Node token presence boolean check | `true` |
| Operator production target confirmation | passed |
| Azure target show read-only check | passed |
| Azure hostname list read-only check | passed; apex and `www` Ready |
| SWA CLI version | `2.0.9` |
| `npm run build:static:ice:sanitized` | passed; `sanitized_20260613174033` |
| `npm run validate:static:ice` | passed with 34 existing warnings |
| `npm run type-check` | passed |
| `node scripts/static-publish.mjs generate` | passed with 34 existing warnings |
| Static output validator | passed; 0 errors, 0 warnings |
| Staging package validator | passed; 0 errors, 0 warnings |
| Artifact root selection | passed |
| Deploy workspace copy/hash parity | passed |
| Artifact security scan | passed |
| Corrected production deployment | passed; exit code 0 |
| Production route verification | passed; 6 of 6 returned 200 OK |

Follow-up repository validation after file creation and platform tracker updates:

| Repository validation | Result |
| --- | --- |
| Required package files | passed; 25 of 25 present |
| `result-manifest.json` parse | passed |
| `git diff --check` on platform tracker docs | passed; line-ending normalization warnings only |
| Trailing whitespace scan on new V2.8.17D files | passed |
| Secret-pattern scan on V2.8.17D files and platform tracker docs | passed; no matches |
| Targeted `git status --short` | expected 4 modified platform docs, 1 new root report, and 1 new result package |
