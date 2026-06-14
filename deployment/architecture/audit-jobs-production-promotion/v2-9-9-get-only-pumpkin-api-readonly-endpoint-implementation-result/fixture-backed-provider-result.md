# Fixture-Backed Provider Result

Implemented provider:

`FixtureAuditJobReadOnlyProvider`

Fixture source:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`

Provider behavior:

- loads only the committed local fixture;
- validates schema `audit-job-ledger-readonly-api-envelope.v1`;
- requires top-level and data-level `readOnly: true`;
- rejects open write-boundary flags;
- preserves source fixture provider mode `local-fixture-readonly` in metadata;
- returns API provider mode `api-local-fixture-readonly`;
- returns `null` for wrong tenant/site scope or missing fixture.

No live provider, CMS, Azure, Search Console, contact, deployment, crawl, or protected config path is used.

