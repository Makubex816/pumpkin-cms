# Builder Preview Carryforward Validation

Status: passed.

Commands:

- `npm run check` in `deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation`.
- `npm test` in `deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation`.
- `node src/import-package-governance-cli.mjs validate fixtures/valid-ice-carryforward.fixture.json`.
- `node src/import-package-governance-cli.mjs build-package fixtures/valid-ice-carryforward.fixture.json --out .tmp/v2-11-5/ice-carryforward-package`.
- `node src/import-package-governance-cli.mjs preview-package .tmp/v2-11-5/ice-carryforward-package --out .tmp/v2-11-5/ice-preview.json`.
- `node src/import-package-governance-cli.mjs validate fixtures/valid-roller-paused.fixture.json`.
- `node src/import-package-governance-cli.mjs build-package fixtures/valid-roller-paused.fixture.json --out .tmp/v2-11-5/roller-paused-package`.
- `node src/import-package-governance-cli.mjs preview-package .tmp/v2-11-5/roller-paused-package --out .tmp/v2-11-5/roller-preview.json`.

Results:

- Governance `check` passed.
- Governance `test` passed with valid fixtures, invalid fixtures, builder previews, and intake preview contract tests.
- Ice validate/build/preview passed.
- Roller validate/build/preview passed.
- Generated evidence stayed under ignored `.tmp/v2-11-5`.

