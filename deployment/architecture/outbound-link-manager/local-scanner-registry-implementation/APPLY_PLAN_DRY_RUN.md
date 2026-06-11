# Apply-Plan Dry-Run

The apply-plan dry-run converts a validated Phase 2H-17 migration dry-run package into provider-shaped write-plan records.

It does not apply, upsert, delete, patch, or mutate any provider. Every planned record has:

- `writeExecution: not_executed`
- `dryRunOnly: true`
- `liveWriteAllowed: false`
- `productionWriteAllowed: false`
- `requiresFutureApproval: true`

## Output Files

- `apply-plan-manifest.json`
- `apply-plan-records.json`
- `provider-profile.json`
- `provider-capabilities.json`
- `provider-boundary-report.json`
- `trace-continuity-result.json`
- `resource-registry-update-candidate.json`
- `backup-center-pre-migration-check.json`
- `rollback-integration-result.json`
- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`

## Commands

```powershell
node src/outbound-link-cli.mjs apply-plan-dry-run --migration .tmp/phase-2h17-migration-dry-run --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/apply-plan --overwrite
node src/outbound-link-cli.mjs validate-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
node src/outbound-link-cli.mjs inspect-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
```

Blocked profiles still write a local blocked evidence package under `.tmp` so operators can prove that live-readonly or unavailable live-write profiles do not cross the persistence boundary.

