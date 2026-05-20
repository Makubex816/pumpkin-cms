# Pumpkin Import Diff / Change Preview - Phase 6O Report

## Summary

Phase 6O adds a tenant-scoped Import Diff Preview workflow for comparing incoming/staged Page JSON against current CMS pages before any import write mode. The preview is no-write only and does not create pages, update pages, create revisions, publish, deploy, or purge.

## Files Changed

- `apps/admin/src/lib/import-diff.ts`
- `apps/admin/src/app/dashboard/pages/import-diff/page.tsx`
- `apps/admin/src/app/dashboard/pages/content-packages/page.tsx`
- `apps/admin/src/app/dashboard/pages/content-validator/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `deployment/static-azure/import-diff-change-preview.md`
- `PUMPKIN_IMPORT_DIFF_PREVIEW_PHASE6O_REPORT.md`

## Diff Matching Rules

Incoming pages are matched to current tenant CMS pages by:

- `id`
- `PageId`
- normalized `pageSlug`

The diff helper warns or errors when:

- incoming `tenantId` is missing
- incoming `tenantId` does not match the selected tenant
- `id` / `PageId` match one page but `pageSlug` matches another
- duplicate incoming same-tenant slugs exist
- incoming JSON would update a published page
- incoming JSON changes an existing slug
- slug changes lack previous-slug/redirect coverage
- redirect records are malformed or loop
- canonical URL does not match incoming slug

## UI Route And Integration

Added route:

```text
/dashboard/pages/import-diff
```

The route supports:

- paste JSON
- upload JSON
- select import mode context
- load JSON from staged package handoff
- run no-write diff preview
- view summary cards
- view risk groups
- view per-page change summaries
- expand per-page details
- copy summary
- download diff report JSON
- hand JSON back to Import/Export

Links/actions were added from:

- Content Package Staging
- Content JSON Contract Validator
- Page Import/Export

## Risk Categories

Risk categories shown in the UI:

- SEO risk
- slug/redirect risk
- publishing risk
- media risk
- fulfillment/Ads risk
- form/lead capture risk
- destructive overwrite risk
- tenant mismatch
- static rebuild needed

## Field-Level Change Summary

The diff preview summarizes high-signal fields rather than rendering a huge raw JSON diff:

- `MetaData.title`
- `pageSlug`
- `isPublished`
- `includeInSitemap`
- `seo.metaTitle`
- `seo.metaDescription`
- `seo.canonicalUrl`
- `searchData.keyword`
- `template.templateKey`
- `workflow.status`
- `staticPublishing.staticEligible`
- `fulfillment.fulfillmentStatus`
- `formConfig`
- `media.featuredImage`
- `media.heroImage`
- `media.localImage`
- `media.closingImage`
- `previousSlugs`
- `redirects`
- `ContentData.ContentBlocks` count/type summary

## Staged Package Integration

Content Package Staging now has a `Preview Diff` action for package rows and selected package details.

The action passes package JSON through browser localStorage to `/dashboard/pages/import-diff`. No import runs automatically.

## Import/Export Integration

Import/Export now includes:

- a header link to Import Diff Preview
- `Preview Diff Before Import` near the existing dry-run/import controls

When JSON is loaded in Import/Export, the preview button passes that JSON to Import Diff Preview. CSV input is not converted by this route; admins should continue using the existing CSV/XLSX dry-run behavior for those formats.

## Revision/Rollback Messaging

For update previews, the UI shows:

- whether a published page would be overwritten
- whether the slug would change
- whether rollback metadata appears available on the existing page
- whether a static rebuild would be needed after import

No revisions are created during diff preview.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for changed files - passed
- browser smoke test for Import Diff Preview - passed
- `git diff --check` - passed with line-ending normalization warnings only
- protected config check for `.env.local` and `appsettings.Development.json` - no changes
- targeted high-confidence secret scan over changed files - passed

## Runtime Verification

Browser smoke verification completed:

- Opened `/dashboard/pages/import-diff` in an authenticated local admin browser context.
- Pasted placeholder-safe JSON matching an existing Ice tenant page slug and previewed an update.
- Confirmed the update summary appeared with `1 updates` and field-level changes including title/SEO changes.
- Pasted placeholder-safe JSON with a new Ice tenant slug and previewed a create.
- Confirmed the create summary appeared with `1 creates`.
- Pasted placeholder-safe JSON with a Roller tenantId while Ice was selected.
- Confirmed the downloaded diff report included a tenant mismatch error.
- Downloaded a diff report JSON; the smoke artifact was deleted and was not committed.
- Simulated a staged-package handoff through browser localStorage.
- Confirmed Import Diff loaded the staged JSON handoff and did not run import.
- Opened Import/Export afterward and confirmed it remained a separate workflow.
- Ice page count remained unchanged at `8` before and after the smoke test.
- The existing test page title was unchanged after preview.
- No Page documents were created or updated.
- No import, publish, deploy, purge, static export, or revision creation occurred.

## Known Limitations

- Diff preview currently supports JSON input. CSV/XLSX should use existing import dry-runs until a later field-by-field CSV/XLSX diff is needed.
- Field summaries are intentionally high-signal and do not show a full raw JSON diff by default.
- The diff engine does not verify MediaAsset IDs against the MediaAsset registry.
- The diff engine does not calculate exact content hashes.
- The diff engine does not run the backend import validator or create revisions.

## Next Recommended Phase

After real external content packages exist, add a package-review checklist that combines contract validation, import diff report, and import dry-run report into one pre-import approval artifact.
