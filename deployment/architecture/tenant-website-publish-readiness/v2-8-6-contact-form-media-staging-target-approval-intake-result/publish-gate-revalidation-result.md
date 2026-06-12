# Publish Gate Revalidation Result

Status: local publish-gate inputs revalidated.

| Gate | Result |
| --- | --- |
| Ice seed validation | passed, 3 page documents |
| Sanitized no-dotenv static build | passed, `sanitized_20260612151525` |
| Type-check | passed |
| Static source validation | passed with 34 existing warnings |
| Static output classifier | blocked external approval gate only |
| Staging package classifier | blocked external approval gate only |
| Runtime QA harness check | passed, 6 tests |
| Runtime QA evidence | passed, `runtimeqa_67425f67f7a4c3d7` |
| Runtime QA evidence validation | passed with 1 warning |
| Resource Registry operational bindings | passed, 0 failures, 0 warnings |
| OLM provider profile check | passed, `liveWriteAllowed: false` |
| No-uncontrolled-write scan | passed, no matches |

No live service mutation or live URL check occurred.
