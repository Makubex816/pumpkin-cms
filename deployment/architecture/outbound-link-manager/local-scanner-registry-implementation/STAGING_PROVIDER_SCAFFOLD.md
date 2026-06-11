# Staging Provider Scaffold

Phase 2H-19 adds a local/offline staging-provider scaffold for the Outbound Link Manager migration path.

The scaffold bridges Phase 2H-17 production-shaped migration candidates toward a future persistence provider without executing a production migration or writing to any live provider.

## Implemented Pieces

- provider profile contracts for local, staging-simulated, live-readonly, and live-write-approved fixtures
- staging provider interface and staging-simulated adapter
- no-live-write provider gate
- provider capability report writer
- provider boundary report writer
- apply-plan dry-run mapper and validator
- trace continuity validation across migration records and apply-plan records
- Resource Registry update candidate integration
- Backup Center pre-migration check integration
- rollback package integration validation

## CLI Path

```powershell
node src/outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/provider-check
node src/outbound-link-cli.mjs apply-plan-dry-run --migration .tmp/phase-2h17-migration-dry-run --profile fixtures/provider-profile-staging-simulated.fixture.json --out .tmp/phase-2h19-staging-provider/apply-plan --overwrite
node src/outbound-link-cli.mjs validate-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
node src/outbound-link-cli.mjs inspect-apply-plan --apply-plan .tmp/phase-2h19-staging-provider/apply-plan
```

## Boundaries

- local/offline operation remains the default
- staging-simulated can produce write plans only, not execute writes
- live-readonly blocks apply-plan write planning
- live-write-approved remains blocked until a future explicit approval profile is implemented
- no Azure, CMS, API, crawler, deployment, indexing, or publication call is made
- all generated evidence is written under ignored `.tmp`

