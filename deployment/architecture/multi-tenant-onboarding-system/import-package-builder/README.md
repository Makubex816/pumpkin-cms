# Phase 2B-1A Import Package Builder Skeleton

This package implements the first local/offline builder skeleton for Pumpkin CMS multi-tenant onboarding import packages.

It reads a non-secret answers JSON file, generates a tenant import package folder, optionally runs the existing offline validator, and can write validator support reports into the generated package folder.

## Boundary

This builder is local/offline only. It does not create tenants, write CMS data, write MediaAsset records, modify Azure, modify Cloudflare, change DNS, deploy code, change Function settings, send email, use Microsoft 365, submit sitemaps, request indexing, use Search Console, perform external HTTP checks, read protected config, or perform Roller work.

## Quick Start

```powershell
npm test
npm run check
npm run validate:generated-example
```

Direct CLI example:

```powershell
node src/builder-cli.mjs --answers fixtures/example-event-rentals.answers.json --out .tmp/generated-example --validate --support-packet
```

The `.tmp/` output folder is ignored by this package.

## Implemented

- answers JSON loading and parse failure handling
- pre-generation answer validation
- secret-like value rejection before generation
- local/staging URL and local path rejection in answers
- deterministic package file generation
- safe output handling with explicit `--overwrite`
- `--dry-run` planning mode
- existing offline validator integration
- support packet export through the validator
- fake fixtures for valid and invalid answers
- Node built-in tests

## Package Shape

Generated packages include:

- `README.md`
- `manifest.json`
- `tenant.json`
- `site.json`
- `routes.json`
- `pages/*.json`
- `media-assets.json`
- `forms.json`
- `seo.json`
- `theme.json`
- `redirects.json`

When validation/support export is requested, the existing validator also writes:

- `validation-report.json`
- `VALIDATION_REPORT.md`
- `support-packet.json`
- `OPERATOR_HANDOFF.md`
- `NON_TECHNICAL_SUMMARY.md`
- `NEXT_ACTIONS.md`
- `PACKAGE_FILE_INVENTORY.md`

See the companion docs in this folder for field details, generated package format, validator integration, support packet export, and known limitations.
