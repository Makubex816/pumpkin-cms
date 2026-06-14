# Audit Ledger Contract Validation Result

Status: passed.

Commands run in `deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation`:

- `npm run check`
- `npm test`
- `node src/audit-job-ledger-cli.mjs validate fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`
- `node src/audit-job-ledger-cli.mjs viewer-summary fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`
- `node src/audit-job-ledger-cli.mjs api-fixture fixtures/valid-v2-8-combined-promotion-ledger.fixture.json`
- `node src/audit-job-ledger-cli.mjs validate-contract fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`

Results:

- Package check passed.
- Package tests passed: 22 tests.
- Ledger validator passed: 11 audit events, 9 job runs, 11 promotion gates, 13 evidence bindings, 0 failures.
- Viewer summary passed: 12 panels, 107 trace entries, 1 warning, 0 blockers, 2 next gates.
- API fixture command returned a read-only envelope with schema `audit-job-ledger-readonly-api-envelope.v1`.
- Contract validation passed for provider mode `local-fixture-readonly`, `readOnly: true`, and 0 failures.
