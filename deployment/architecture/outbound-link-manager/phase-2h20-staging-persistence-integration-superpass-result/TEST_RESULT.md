# Test Result

Commands run:

```powershell
npm run check
npm run type-check
node src/outbound-link-cli.mjs validate-migration-dry-run --migration .tmp/phase-2h20-staging-persistence-integration/migration-refresh
node src/outbound-link-cli.mjs validate-apply-plan --apply-plan .tmp/phase-2h20-staging-persistence-integration/apply-plan-refresh
node src/outbound-link-cli.mjs staging-execute --apply-plan .tmp/phase-2h20-staging-persistence-integration/apply-plan-refresh --profile fixtures/staging-execution-profile.fixture.json --out .tmp/phase-2h20-staging-persistence-integration/execution --overwrite
node src/outbound-link-cli.mjs staging-readback --execution .tmp/phase-2h20-staging-persistence-integration/execution --out .tmp/phase-2h20-staging-persistence-integration/readback
node src/outbound-link-cli.mjs validate-staging-execution --execution .tmp/phase-2h20-staging-persistence-integration/execution
node src/outbound-link-cli.mjs api-provider-state --execution .tmp/phase-2h20-staging-persistence-integration/execution --tenant fixture-tenant --site fixture-site --out .tmp/phase-2h20-staging-persistence-integration/api-provider-state
```

Results:

- local package `npm run check`: passed, 111 tests passed
- Admin `npm run type-check`: passed
- migration refresh validation: passed
- apply-plan refresh validation: passed
- staging execution: passed, 48 records
- staging readback: passed, 48 records
- staging execution validation: passed, 0 failures
- API provider state: OK
- live-readonly execution: blocked by design
- live-write-approved execution: blocked by design

