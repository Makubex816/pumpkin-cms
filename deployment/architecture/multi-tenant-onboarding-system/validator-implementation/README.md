# Phase 2A-1 Offline Validator Skeleton

This package implements the first local-only validator skeleton for Pumpkin CMS multi-tenant import packages.

It runs from a local package folder and does not contact CMS, MediaAsset storage, Azure, Cloudflare, DNS, deployment systems, Function App settings, email, Microsoft 365, Search Console, or Roller.

## Implemented

- required-file discovery
- schema loading from `../import-package-spec/schemas/`
- JSON parse validation
- basic JSON Schema validation for the schema features used by the import package schemas
- minimal cross-file checks for tenant/site identity and route/page coverage
- offline URL safety and secret-pattern scans
- normalized gate statuses
- `validation-report.json`
- `VALIDATION_REPORT.md`
- fake local fixtures
- Node built-in tests

## Run

```powershell
npm test
npm run check
npm run validate:example
```

Example direct CLI use:

```powershell
node src/cli.mjs --package fixtures/valid-minimal --out .tmp/valid-minimal-report
```

The `.tmp/` output folder is ignored by this package.
