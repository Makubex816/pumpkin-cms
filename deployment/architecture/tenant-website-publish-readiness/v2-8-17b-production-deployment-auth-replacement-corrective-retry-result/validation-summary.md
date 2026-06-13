# Validation Summary

| Validation | Result |
| --- | --- |
| V2.8.17A carryforward review | passed |
| PowerShell token presence check | passed, boolean only |
| Node token presence check | passed, boolean only |
| Operator target confirmation | passed |
| Azure production target read-only metadata | passed |
| Azure production hostname read-only metadata | passed, both domains `Ready` |
| SWA CLI version | passed, `2.0.9` |
| `npm run build:static:ice:sanitized` | passed, selected `sanitized_20260613140129` |
| `npm run validate:static:ice` | passed with `34` existing warnings |
| `npm run type-check` | passed |
| `node scripts/static-publish.mjs generate` | passed with `34` existing warnings |
| Static output validator | passed, 0 errors, 0 warnings |
| Staging package validator | passed, 0 errors, 0 warnings |
| Artifact security scan | passed |
| Corrective deployment | failed, exit code `1` |
| Production route checks | not run because deployment failed |

