# Local Validation Result

| Validation | Result |
| --- | --- |
| `npm run build:static:ice:sanitized` | passed, run `sanitized_20260612200048` |
| `npm run validate:static:ice` | passed with 34 warnings |
| `npm run type-check` | passed |
| Static output validator | expected no-go, local static integrity passed, 1 backend gate remains |
| Staging package validator | expected no-go, local static integrity passed, 1 backend gate remains |
| Runtime QA `npm run check` | passed |
| Runtime QA evidence run | passed, `runtimeqa_22fc50f962b9fef0` |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM provider profile check | passed; live writes disabled |

Expected no-go validator exits are backend-boundary enforcement, not static integrity failures.

