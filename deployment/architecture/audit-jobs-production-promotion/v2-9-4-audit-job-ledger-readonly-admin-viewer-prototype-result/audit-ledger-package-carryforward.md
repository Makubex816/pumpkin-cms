# Audit Ledger Package Carryforward

The audit-job-ledger implementation package remains valid.

## Commands

```powershell
npm run check
npm test
node src/audit-job-ledger-cli.mjs viewer-summary fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

Working directory:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation`

## Results

- `npm run check`: passed.
- `npm test`: 15 tests passed.
- `viewer-summary`: passed with `ok: true`.
