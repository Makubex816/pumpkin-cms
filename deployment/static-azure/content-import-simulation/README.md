# Phase 6S Production Content Import Simulation Pack

This folder contains placeholder-safe JSON packages for proving the Pumpkin CMS production content import workflow before real externally generated content JSONs are used.

These files are not production content. They do not contain provider claims, state research, real contact routing credentials, email provider secrets, or deploy instructions.

## Packages

- `simulation-package-valid.json`
  - A wrapped export-style package with one unpublished, noindex local-only service page.
  - Exercises SEO, media, fulfillment, service schema, `productsOffered`, `areasServed`, lead capture, domain routing references, internal links, schema controls, page quality, and content blocks.

- `simulation-package-with-warnings.json`
  - An intentionally incomplete package.
  - Exercises warning behavior for missing `productsOffered`, missing `areasServed`, missing static form endpoint metadata, image asset metadata gaps, and conservative workflow/page quality status.

- `simulation-package-existing-page-update.json`
  - A package designed to match `phase-6d-redirect-test` when that safe local page exists.
  - Exercises update-preview behavior for title, SEO description, products offered, areas served, routing references, and page quality.

- `simulation-workflow-checklist.md`
  - Manual and Codex-safe test steps for Validator, Content Package Staging, Import Diff, Import/Export preflight, dry-run import, and ImportRun history.

## Safety Rules

- Keep import mode as `dry-run` unless intentionally using a disposable local test page.
- Do not publish simulation pages.
- Do not deploy to Azure.
- Do not modify Cloudflare.
- Do not send emails.
- Do not add email credentials.
- Do not create provider research or state research files.
- Do not treat placeholder URLs or service items as real claims.

## Intended Workflow

1. Validate a simulation package in Content JSON Validator.
2. Stage it in Content Package Staging.
3. Preview creates/updates in Import Diff.
4. Load it into Import/Export.
5. Review preflight guardrails.
6. Run dry-run only.
7. Save the dry-run report to ImportRun history if authenticated CMS history is available.

Staging, validation, diff, and dry-run review are separate from real import writes. Existing Import/Export remains the only write path.
