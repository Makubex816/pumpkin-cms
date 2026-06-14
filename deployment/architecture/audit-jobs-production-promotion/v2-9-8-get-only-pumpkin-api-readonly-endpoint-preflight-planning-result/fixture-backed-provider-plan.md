# Fixture-Backed Provider Plan

Status: planned only.

Fixture source:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`

Expected fixture facts:

- schema: `audit-job-ledger-readonly-api-envelope.v1`;
- provider mode: `local-fixture-readonly`;
- read-only: `true`;
- tenant key: `ice-rink-rentals`;
- site key: `ice-rink-rentals`;
- panels: `12`;
- audit events: `11`;
- job runs: `9`;
- promotion gates: `11`;
- evidence bindings: `13`;
- trace entries: `107`;
- warnings: `1`;
- blockers: `0`;
- next gates: `2`.

Provider requirements:

- load only committed local fixture evidence;
- validate schema version before returning data;
- reject non-read-only envelopes;
- reject missing provider mode;
- reject open write flags;
- preserve deferred indexing state;
- preserve request and correlation IDs or regenerate route-level IDs while preserving fixture correlation evidence in metadata;
- never read protected config;
- never call live provider, CMS, Azure, Search Console, deployment, contact, or outbound live URLs.

V2.9.8 does not add the provider code.

