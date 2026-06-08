# Phase 2A Offline Validator

This package implements the local-only validator for Pumpkin CMS multi-tenant import packages.

It reads a local package folder and writes local reports only. It does not contact CMS, MediaAsset storage, Azure, Cloudflare, DNS, deployment systems, Function App settings, email, Microsoft 365, Search Console, indexing APIs, external HTTP endpoints, protected config, or Roller.

## Implemented

- required-file discovery
- schema loading from `../import-package-spec/schemas/`
- JSON parse validation
- basic JSON Schema validation for the schema features used by the import package schemas
- cross-file checks for tenant/site identity, route/page coverage, duplicate routes, duplicate slugs, forbidden routes, obsolete routes, unrelated tenant references, and paused tenant references
- media reference validation from page blocks to `media-assets.json`
- form reference validation from page blocks to `forms.json`
- SEO/canonical checks for production-ready packages
- offline URL safety and secret-pattern scans
- normalized gate statuses
- `validation-report.json`
- `VALIDATION_REPORT.md`
- optional support packet export
- operator handoff report
- non-technical summary report
- stable error explanation catalog
- fake local fixtures
- Node built-in tests

## Run

```powershell
npm test
npm run check
npm run validate:example
npm run support:example
```

Direct CLI examples:

```powershell
node src/cli.mjs --help
node src/cli.mjs --package fixtures/valid-minimal --out .tmp/valid-minimal-report
node src/cli.mjs --package fixtures/valid-minimal --out .tmp/valid-minimal-support --support-packet
node src/cli.mjs --explain-error JSON_PARSE_ERROR
```

The `.tmp/` output folder is ignored by this package.

This validator is suitable for pre-import package validation and operator support handoff. It is not an onboarding wizard, tenant creator, CMS importer, deployment tool, Search Console tool, or external monitoring tool.
