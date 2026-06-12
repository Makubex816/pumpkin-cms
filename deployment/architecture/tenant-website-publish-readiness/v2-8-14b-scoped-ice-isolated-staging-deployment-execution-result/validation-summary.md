# Validation Summary

Validation run:

| Check | Result |
| --- | --- |
| Azure isolated target show | passed |
| Azure isolated hostname list | passed, empty custom domains |
| Deployment env-var presence check | blocked, `SWA_CLI_DEPLOYMENT_TOKEN` absent |
| SWA CLI pinned npx version | passed, `2.0.9` |
| Sanitized Ice static build | passed, `sanitized_20260612231928` |
| `npm run validate:static:ice` | passed with 34 existing warnings |
| `npm run type-check` | passed |
| `node scripts/static-publish.mjs generate` | passed with 34 existing warnings |
| Static output validator | passed |
| Staging package validator | passed |
| Artifact security scan | passed |
| Runtime QA check | passed, 6 tests |
| Runtime QA evidence validation | passed with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM provider profile check | passed, live writes disabled |
| Static form endpoint check | passed |
| Static form endpoint tests | passed |
| Deployment readiness wrapper | blocked only by missing auth env var |

No files were staged during validation.

