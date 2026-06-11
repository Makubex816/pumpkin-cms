# Staging Execution Harness

The staging execution harness is implemented in `src/staging-execution/`.

## Commands

```powershell
node src/outbound-link-cli.mjs staging-execute --apply-plan .tmp/phase-2h20-staging-persistence-integration/apply-plan-refresh --profile fixtures/staging-execution-profile.fixture.json --out .tmp/phase-2h20-staging-persistence-integration/execution --overwrite
node src/outbound-link-cli.mjs validate-staging-execution --execution .tmp/phase-2h20-staging-persistence-integration/execution
node src/outbound-link-cli.mjs inspect-staging-execution --execution .tmp/phase-2h20-staging-persistence-integration/execution
```

The harness requires a staging-simulated provider profile with an explicit local staging approval reference. It writes no live provider data and no production database data.

## Outputs

- `staging-execution-manifest.json`
- `staging-execution-records.json`
- `staging-provider-store/`
- `checksums.json`
- `checksums.sha256`
- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`

