# Test Result

Commands run:

```powershell
npm run check
node src/outbound-link-cli.mjs migration-dry-run --store .tmp/phase-2h17-migration-dry-run-source/local-store-policy --profile fixtures/migration-production-provider-profile.fixture.json --rendered .tmp/phase-2h17-migration-dry-run-source/render-active --out .tmp/phase-2h17-migration-dry-run --overwrite
node src/outbound-link-cli.mjs validate-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
node src/outbound-link-cli.mjs inspect-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
```

Package check result:

- syntax checks: passed
- test suites: Node test runner
- tests: 94
- passed: 94
- failed: 0

Migration validation result:

- status: passed
- failures: 0
- warnings: 0

