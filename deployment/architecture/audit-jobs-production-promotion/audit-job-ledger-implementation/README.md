# Audit Job Ledger No-Write Validator

Status: V2.9.2 local implementation foundation.

This package turns the V2.9.1 audit jobs / production promotion planning model into an executable local validator for safe JSON ledger fixtures.

It validates:

- Audit event records from the V2.9.1 event taxonomy.
- Job run records from the V2.9.1 job taxonomy.
- Promotion gates, gate states, gate results, required evidence, and actual evidence.
- Evidence bindings with repo-relative safe paths.
- Cross-layer trace ID requirements for V2.8 production release, contact-form verification, indexing deferral, Runtime QA, Resource Registry, Provider Profile, OLM, rollback, and future-boundary records.
- No-write safety boundaries.

It does not deploy, redeploy, change DNS, alter custom domains, call Google/Search Console/indexing APIs, crawl, follow outbound links, submit contact forms, POST to contact endpoints, mutate CMS/provider/Azure state, read protected config, print/use tokens, call keys/listKeys, generate connection strings, or generate SAS.

## Commands

```powershell
npm run check
npm test
node src/audit-job-ledger-cli.mjs validate fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
node src/audit-job-ledger-cli.mjs inspect fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

## Fixtures

Valid fixtures:

- `valid-v2-8-production-static-release-ledger.fixture.json`
- `valid-v2-8-contact-form-verification-ledger.fixture.json`
- `valid-v2-8-indexing-deferred-ledger.fixture.json`
- `valid-v2-8-combined-promotion-ledger.fixture.json`

Invalid fixtures:

- `invalid-missing-trace-id.fixture.json`
- `invalid-missing-artifact-hash.fixture.json`
- `invalid-unsupported-event-type.fixture.json`
- `invalid-promotion-gate-open-with-complete-result.fixture.json`

The fixtures use safe summaries and repo-relative evidence IDs only. Raw contact payloads, full response IDs, credentials, protected config values, deployment tokens, OAuth tokens, keys, connection strings, SAS values, and private data are not stored.
