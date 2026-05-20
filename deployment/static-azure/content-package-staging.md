# Content Package Staging

Phase 6N adds a browser-local review queue for externally generated Page JSON before it reaches the existing import workflow.

## Purpose

Timothy can generate content JSON outside Pumpkin CMS, then stage it in the admin for contract validation, review, approval, rejection, and import handoff. Staging is intentionally not an import path.

The staging workflow helps prevent unfinished, invalid, or wrong-tenant content from being bulk imported by accident.

## Admin Workflow

1. Open `Pages > Import/Export`.
2. Open `Stage content package`, or go directly to `/dashboard/pages/content-packages`.
3. Paste or upload a Page JSON document, Page array, or wrapped export object with `pages[]`.
4. Add a package name, notes, and source label such as `external_content_generation`.
5. Stage the package.
6. Review validation results, template distribution, page slugs, errors, and warnings.
7. Revalidate after changes if needed.
8. Mark the package `ready_for_import` only after blocking errors are resolved, or mark it `rejected`.
9. Use `Open Import/Export With This Package` to preload JSON into the existing import page.
10. Run the normal Import/Export dry-run before any write mode.

## What Staging Does

- Stores package metadata in browser localStorage.
- Runs the Phase 6M content JSON contract validator.
- Records validation summaries and per-page results.
- Allows review statuses:
  - `draft`
  - `needs_review`
  - `ready_for_import`
  - `rejected`
- Allows package JSON and validation report downloads.
- Provides a localStorage handoff to the existing Import/Export screen.

## What Staging Does Not Do

- It does not create Page documents.
- It does not update Page documents.
- It does not publish pages.
- It does not run static export.
- It does not deploy to Azure.
- It does not purge Cloudflare.
- It does not create provider or state research files.

## Import Handoff

The handoff writes the staged package JSON to a temporary browser localStorage key and opens `/dashboard/pages/import-export`.

The Import/Export page then:

- switches to JSON source mode
- fills the import textarea with the staged JSON
- shows a notice naming the staged package
- leaves import mode as dry-run by default

The admin must still run dry-run and intentionally choose a write mode before any Page document is changed.

## LocalStorage MVP Limitation

This phase uses localStorage by design. Package history is local to one browser/profile and is not authoritative.

A future CMS-backed package registry could store package review history across browsers and operators. That future registry should still keep import as an explicit separate action.

## Safety Notes

- Use tenant-specific admin context before staging.
- Treat validation errors as blockers.
- Treat warnings as review items.
- Do not mark generated packages ready until SEO, media, fulfillment, form, and static publishing warnings have been reviewed.
- Download validation reports for audit trails before import.
