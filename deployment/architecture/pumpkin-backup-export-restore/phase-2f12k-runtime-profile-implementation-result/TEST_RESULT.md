# Test Result

## Commands Run

```powershell
npm test
npm run check
node src/backup-cli.mjs runtime-profile:list
node src/backup-cli.mjs runtime-profile:inspect --runtime-fixture fixtures/runtime-profile.ice.future-target-cosmos.json
node src/backup-cli.mjs runtime-profile:validate --runtime-fixture fixtures/runtime-profile.production-write-approved.blocked.json
```

## Result

- `npm test`: passed, 68 tests.
- `npm run check`: passed, including syntax checks and 68 tests.
- Runtime profile CLI checks: passed.

## New Coverage

- Local-dev profile resolves offline and allows fake proof only.
- Offline-bundle profile resolves without provider source.
- Fake-provider profile allows fake proof and blocks live export.
- Ice future-target Cosmos resolves to `runtime-cosmos-future`.
- Production-write-approved remains blocked even with future gates set true in fixture.
- Provider resolver output maps to runtime profile states.
- Fake complete export is blocked outside fake/local profiles.
- CLI output contains non-secret status fields.

