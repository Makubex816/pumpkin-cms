# Publish Gate Final Revalidation

## Local Static Gates

| Gate | Result |
| --- | --- |
| Canonical Ice routes | passed: `/`, `/service-areas`, `/contact` |
| Static source validation | passed with 34 existing warnings |
| Type-check | passed |
| Sanitized no-dotenv static build | passed |
| Static generation | passed inside sanitized build |
| Static output validator | expected no-go: local integrity passed, 1 backend gate remains |
| Staging package validator | expected no-go: local integrity passed, 1 backend gate remains |

## Platform Control Gates

| Gate | Result |
| --- | --- |
| Runtime QA package check | passed |
| Runtime QA evidence run | `runtimeqa_22fc50f962b9fef0`, passed |
| Resource Registry operational binding validator | passed |
| OLM provider profile check | passed for planning; live writes disabled |

Publish execution remains blocked.

