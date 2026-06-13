# Validation Summary

| Validation | Result |
| --- | --- |
| V2.8.17B carryforward review | passed |
| PowerShell token presence check | passed, boolean only |
| Node token presence check | passed, boolean only |
| Token-target match | carried forward from V2.8.17C approval context |
| Azure production target read-only metadata | passed |
| Azure production hostname read-only metadata | passed, both domains `Ready` |
| SWA CLI version | passed, `2.0.9` |
| `npm run build:static:ice:sanitized` | passed, selected `sanitized_20260613172317` |
| `npm run validate:static:ice` | passed with `34` existing warnings |
| `npm run type-check` | passed |
| `node scripts/static-publish.mjs generate` | passed with `34` existing warnings |
| Static output validator | passed, 0 errors, 0 warnings |
| Staging package validator | passed, 0 errors, 0 warnings |
| Artifact security scan | passed |
| Corrected production deployment | failed, command-shape exit code `1` |
| Production route checks | not run because deployment failed |

No source or script files were intentionally edited in V2.8.17C; the only planned edits are documentation and result-package files.

