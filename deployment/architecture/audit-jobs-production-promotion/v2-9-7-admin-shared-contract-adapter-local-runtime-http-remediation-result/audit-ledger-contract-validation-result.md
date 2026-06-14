# Audit Ledger Contract Validation Result

Status: passed.

Audit-ledger implementation package:

- `npm run check`: passed.
- `npm test`: 22 tests passed.
- `node src/audit-job-ledger-cli.mjs validate fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`: 11 audit events, 9 job runs, 11 promotion gates, 13 evidence bindings, 0 failures.
- `node src/audit-job-ledger-cli.mjs viewer-summary fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`: read-only, 107 trace entries, 1 warning, 0 blockers, 2 next gates.
- `node src/audit-job-ledger-cli.mjs api-fixture fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`: read-only API envelope schema v1, provider `local-fixture-readonly`, read-only `true`, 12 panels, runtime HTTP warning carried.
- `node src/audit-job-ledger-cli.mjs validate-contract fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`: passed, 0 failures.

