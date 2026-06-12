# Local Validation Result

| Validation | Result |
| --- | --- |
| `npm run build:static:ice:sanitized` | passed, run `sanitized_20260612173425` |
| `npm run validate:static:ice` | passed with 34 warnings |
| `npm run type-check` | passed |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out <sanitized out>` | expected no-go, local static integrity passed, 2 external gates remain |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder <sanitized out>` | expected no-go, local static integrity passed, 2 external gates remain |
| `npm run check` in Runtime QA harness | passed |
| Runtime QA `run` and `validate-evidence` | passed validation with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM provider profile check | passed; live writes disabled |

The expected no-go validator exits are not local integrity failures. They are the correct enforcement of external approval gates.

