# Import Diff / Change Preview

Phase 6O adds a no-write preview step between content validation/staging and the existing Import/Export write workflow.

## Purpose

The Content JSON Contract Validator checks whether incoming JSON satisfies template and production-readiness rules. Content Package Staging tracks review status. Import Diff Preview answers a different question:

What would this JSON do to the current CMS tenant if it were imported?

## What It Compares

The admin diff page compares incoming Page JSON against current tenant pages by:

- `id`
- `PageId`
- `pageSlug`

It reports:

- creates
- updates
- skips
- conflicts
- errors
- warnings
- field-level change summaries
- risk categories

## Major Fields Summarized

Diff summaries focus on high-signal fields instead of showing a huge raw JSON diff by default:

- title / `MetaData.title`
- `pageSlug`
- `isPublished`
- `includeInSitemap`
- SEO title, description, canonical URL
- target keyword
- template key
- workflow status
- static publishing eligibility
- fulfillment status
- form config
- page media slots
- redirects and previous slugs
- content block count/type changes

The downloadable JSON report contains the full structured preview result.

## Risk Categories

Warnings are grouped into:

- SEO risk
- slug/redirect risk
- publishing risk
- media risk
- fulfillment/Ads risk
- form/lead capture risk
- destructive overwrite risk
- tenant mismatch
- static rebuild needed

## Staged Package Workflow

From Content Package Staging:

1. Stage and validate a package.
2. Review validation errors/warnings.
3. Use `Preview Diff` to send the package JSON to `/dashboard/pages/import-diff`.
4. Run the diff preview.
5. Return to Import/Export only when the package is ready for an intentional dry-run/import.

No pages are imported by the diff preview.

## Import/Export Workflow

From Import/Export:

1. Paste or upload JSON.
2. Use `Preview Diff Before Import`.
3. Review creates, updates, skips, conflicts, and risks.
4. Return to Import/Export.
5. Run the existing dry-run and explicit write mode only if desired.

Import/Export remains the only admin page write path for bulk import.

## Difference From Validation

Validation checks whether a JSON package meets content/template requirements.

Diff preview checks how that package relates to the current CMS data.

Both should be used before importing externally generated content.

## No-Write Safety

Import Diff Preview does not:

- create Page documents
- update Page documents
- create revisions
- publish pages
- run static export
- deploy to Azure
- purge Cloudflare

It is a review and planning surface only.
