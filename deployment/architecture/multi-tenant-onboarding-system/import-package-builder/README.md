# Phase 2B-2 Import Package Builder

This package implements the local/offline builder for Pumpkin CMS multi-tenant onboarding import packages.

It reads a non-secret answers JSON file, validates the answers before generation, generates a tenant import package folder, optionally runs the existing offline validator, and can write validator support reports into the generated package folder.

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

Dry-run preview:

```powershell
node src/builder-cli.mjs --answers fixtures/valid-full-package.answers.json --out .tmp/generated-full --dry-run --validate --support-packet
```

The `.tmp/` output folder is ignored by this package.

## Implemented

- answers JSON loading and parse failure handling
- pre-generation answer validation with stable error codes, suggested fixes, and ask-for-help guidance
- secret-like value rejection before generation
- local/staging URL, URL credential, local path, paused tenant, and unrelated tenant rejection in answers
- deterministic package file generation
- safe output handling with explicit `--overwrite`
- `--dry-run` preview/diff summary mode
- existing offline validator integration
- support packet export through the validator
- builder package summary report
- support packet redaction checks
- fake fixtures for valid and invalid answers
- Node built-in tests

## Field Catalog Alignment

The hardened builder validates these Phase 2B field catalog groups before generation:

- `builderProfile`
- `tenant`
- `domains`
- `routing`
- `pages`
- `media`
- `form` or `forms`
- `seo`
- `analyticsDecision`
- `privacyReviewStatus`
- `ownerContacts`
- `manualApprovals`

Invalid answers fail before package files are written. Error output includes a code, field path, plain-English message, suggested fix, and when to ask for help.

The builder still creates import package candidates only. The offline validator decides whether the generated package is acceptable for the next manual gate.

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
- `BUILDER_PACKAGE_SUMMARY.md`

See the companion docs in this folder for field details, generated package format, validator integration, support packet export, and known limitations.
