# Fixture Coverage Summary

Result: implemented.

Valid fixtures:

| Fixture | Coverage |
| --- | --- |
| `valid-v2-8-production-static-release-ledger.fixture.json` | V2.8.17D production deployment, artifact hash, deployment ID, and route verification |
| `valid-v2-8-contact-form-verification-ledger.fixture.json` | V2.8.19 one approved synthetic contact-form verification evidence without raw payload storage |
| `valid-v2-8-indexing-deferred-ledger.fixture.json` | V2.8.19 Google/Search Console/indexing hard-stop deferral |
| `valid-v2-8-combined-promotion-ledger.fixture.json` | Combined release, route, contact, indexing, Runtime QA, Resource Registry, Provider Profile, OLM, Backup Center, rollback, and future-boundary records |

Invalid fixtures:

| Fixture | Expected failure |
| --- | --- |
| `invalid-missing-trace-id.fixture.json` | `MISSING_TRACE_ID` |
| `invalid-missing-artifact-hash.fixture.json` | `MISSING_ARTIFACT_HASH` |
| `invalid-unsupported-event-type.fixture.json` | `UNSUPPORTED_EVENT_TYPE` |
| `invalid-promotion-gate-open-with-complete-result.fixture.json` | `PROMOTION_GATE_COMPLETE_WHILE_OPEN` |
