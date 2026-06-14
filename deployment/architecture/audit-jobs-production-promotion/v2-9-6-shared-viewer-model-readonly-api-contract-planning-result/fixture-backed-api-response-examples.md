# Fixture-Backed API Response Examples

Status: implemented.

Generated fixture:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`

Generation command:

`node src/audit-job-ledger-cli.mjs api-fixture fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`

Validation command:

`node src/audit-job-ledger-cli.mjs validate-contract fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`

The generated envelope is backed by the combined V2.8 ledger fixture and contains the shared viewer model, read-only API envelope, source metadata, security boundary, redaction policy, and V2.9.5 runtime HTTP warning carryforward.
