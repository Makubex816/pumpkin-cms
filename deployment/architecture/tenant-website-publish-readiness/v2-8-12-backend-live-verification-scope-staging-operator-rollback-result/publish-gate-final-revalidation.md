# Publish Gate Final Revalidation

Commands and results:

| Check | Result |
| --- | --- |
| `npm run build:static:ice:sanitized` | passed |
| `npm run validate:static:ice` | passed with 34 existing warnings |
| `npm run type-check` | passed |
| `node scripts/static-publish.mjs generate` | passed with 34 existing warnings |
| static output validator | expected no-go; local static integrity passed, backend gate remains |
| staging package validator | expected no-go; local static integrity passed, backend gate remains |
| Runtime QA harness check | passed |
| Runtime QA evidence run | passed, `runtimeqa_50d0759d4b62e457` |
| Runtime QA evidence validation | passed with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM provider profile check | passed, live writes disabled |
| static form endpoint local check/tests | passed |

No deployment, POST, payload submission, provider write, CMS write, Azure mutation, RBAC assignment, DNS change, indexing, or live publication occurred.

