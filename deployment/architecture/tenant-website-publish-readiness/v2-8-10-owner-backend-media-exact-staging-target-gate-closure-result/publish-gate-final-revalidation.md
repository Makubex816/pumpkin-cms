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
| Runtime QA evidence run | `runtimeqa_4e5c6b577de55e99`, passed |
| Resource Registry operational binding validator | passed |
| OLM provider profile check | passed for planning; live writes disabled |
| OLM publish-gate CLI | no separate CLI found; provider profile/no-live-write gate used |

Publish execution remains blocked.

