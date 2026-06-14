# Usage

Run from this package directory:

```powershell
cd deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation
npm run check
npm test
```

Validate a fixture:

```powershell
node src/audit-job-ledger-cli.mjs validate fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

Inspect a fixture:

```powershell
node src/audit-job-ledger-cli.mjs inspect fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

Build the local read-only viewer summary:

```powershell
node src/audit-job-ledger-cli.mjs viewer-summary fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

Expected behavior:

- Valid fixtures exit `0` and print `ok: true`.
- Invalid fixtures exit nonzero and print `ok: false` with failure codes.
- `inspect` prints counts, event types, job types, gate states, gate results, and compact safety state.
- `viewer-summary` prints the full read-only operator viewer model with panels, detail rows, trace search entries, warnings, blockers, next gates, and security boundary state.

This CLI reads local JSON files only and prints validation output to stdout. It writes no files and opens no network connections.
