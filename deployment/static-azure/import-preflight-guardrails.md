# Import Preflight Guardrails

Phase 6P hardens the existing Page Import/Export workflow before externally generated content packages are used for production imports.

## Validation vs Diff vs Import

Validation answers:

- Does this JSON satisfy the Page/template/content contract?
- Are required SEO, media, fulfillment, form, linking, and static publishing fields present?

Diff preview answers:

- What would this JSON do to the current CMS tenant?
- Would it create pages, update pages, skip rows, collide with existing pages, or change risky fields?

Import answers:

- Should the admin intentionally write Page documents to CMS?

The Import/Export page now shows validation and diff preflight before write modes.

## Recommended Production Import Process

1. Stage externally generated content in Content Package Staging.
2. Fix contract validation errors.
3. Preview Import Diff.
4. Review creates, updates, skips, conflicts, and risk categories.
5. Open Import/Export with the staged package.
6. Confirm preflight shows no blocking errors.
7. Run dry-run first.
8. Choose a write mode only after approval.
9. Complete required confirmations.
10. Run import.
11. Review imported pages, revisions, Publishing Dashboard, and Publish Action Center.

## Confirmation Gates

Write imports can be blocked or gated by:

- contract validation errors
- diff preview errors
- tenant mismatch
- id/PageId/slug conflicts
- updates to published pages
- slug changes
- warning-heavy packages

The UI requires explicit confirmation for:

- updating published pages
- slug changes that may affect redirects, SEO, and Ads final URLs
- packages with warnings that should be reviewed

## Staged Package Handoff

When Content Package Staging sends JSON to Import/Export, the preflight section displays package context:

- package name
- tenant
- source label
- review status

If the package is not `ready_for_import`, Import/Export shows a warning. The handoff does not import automatically.

## CSV/XLSX Note

CSV/XLSX import remains available and uses the existing import dry-run/validation logic.

For production content packages, JSON is preferred because it preserves the canonical Page document shape and supports the strongest contract/diff preflight.

## No Deployment Behavior

Import/Export does not:

- deploy to Azure
- purge Cloudflare
- run static export
- hard-delete pages

After any import write, use Publishing Dashboard and Publish Action Center before static publishing.

## Revision/Rollback Expectation

Existing update imports should go through the authenticated page update path, which reports revision snapshot behavior where available. Dry-run and preflight never create revisions.
