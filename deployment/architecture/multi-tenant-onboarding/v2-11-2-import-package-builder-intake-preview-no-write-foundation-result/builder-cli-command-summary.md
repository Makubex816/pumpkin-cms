# Builder CLI Command Summary

Unified CLI:

`deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/src/import-package-governance-cli.mjs`

Commands:

```powershell
node src/import-package-governance-cli.mjs validate fixtures/valid-ice-carryforward.fixture.json
node src/import-package-governance-cli.mjs validate fixtures/valid-roller-paused.fixture.json
node src/import-package-governance-cli.mjs build-package fixtures/valid-ice-carryforward.fixture.json --out .tmp/v2-11-2/ice-carryforward-package
node src/import-package-governance-cli.mjs build-package fixtures/valid-roller-paused.fixture.json --out .tmp/v2-11-2/roller-paused-package
```

Safety behavior:

- output must be under `.tmp`;
- archive output paths are rejected;
- invalid packages return a nonzero exit code;
- no tenant import is executed.
