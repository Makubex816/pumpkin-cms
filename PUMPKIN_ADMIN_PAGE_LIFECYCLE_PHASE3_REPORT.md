# Pumpkin Admin Page Lifecycle Phase 3 Report

## Executive Summary

Phase 3 added safe page lifecycle controls to the admin page manager:

- Create page from a minimal template.
- Duplicate an existing page into a new draft.
- Publish and unpublish existing pages.
- Keep archive unavailable with a clear explanation because the current Page model has no archive/status field.
- Keep hard delete unavailable.

No import/export, static publishing, hard delete, drag-and-drop, environment-file changes, or production-data work were added.

## Files Changed

- `apps/admin/src/app/dashboard/pages/page.tsx`
  - Reworked the page list into a lifecycle manager.
  - Added Create Page modal.
  - Added Duplicate Page modal.
  - Added Publish/Unpublish actions.
  - Added disabled Archive action with model limitation explanation.
- `apps/pumpkin-api/Program.cs`
  - Added minimal tenant/slug safety validation to existing admin create/update page endpoints.
- `PUMPKIN_ADMIN_PAGE_LIFECYCLE_PHASE3_REPORT.md`
  - Added this report.

## Endpoints Used Or Added

No new endpoints were added.

Existing endpoints used:

- `GET /api/admin/pages?tenantId={tenantId}`
- `GET /api/admin/pages/{tenantId}/{pageSlug}`
- `POST /api/admin/pages/{tenantId}`
- `PUT /api/admin/pages/{tenantId}/{pageSlug}`

Existing auth endpoints used:

- `POST /api/auth/login`
- `GET /api/auth/verify`

API safety added to existing admin create/update endpoints:

- Create rejects missing slugs.
- Create rejects request-body tenant mismatch.
- Create rejects same-tenant slug collisions.
- Update rejects missing slugs.
- Update rejects request-body tenant mismatch.
- Update rejects slug changes that would collide with another page in the same tenant.

## Create Page Behavior

The page list now has a Create Page button.

Create flow asks for:

- Page title.
- Page slug.
- Template type:
  - Blank page.
  - Landing starter.
  - Contact starter.
- Published/draft status.
- Include in sitemap.

Create behavior:

- Title is required.
- Slug is required and normalized.
- Slug must be unique within the selected tenant.
- Tenant ID is locked to the selected/current tenant.
- `id` and `PageId` are generated as `{tenantId}-{slug}`.
- Draft pages are created with `isPublished=false`, `publishedAt=null`, and `includeInSitemap=false`.
- Published pages can be created with sitemap inclusion.
- Draft pages are clearly labeled as public routes that may return 404.

## Duplicate Page Behavior

The page list now has a Duplicate action per row.

Duplicate flow asks for:

- New page title.
- New page slug.

Duplicate behavior:

- New title is required.
- New slug is required and normalized.
- New slug must be unique within the selected tenant.
- Source page content blocks are deep-cloned.
- Unknown blocks are preserved because the duplicate flow copies the full page document before replacing only safe identity/status fields.
- New `id` and `PageId` are generated from tenant and slug.
- New `pageSlug` and `MetaData.title` are set from the form.
- `seo.metaTitle` is set to the new title.
- Canonical URL is updated when the source canonical URL is valid; otherwise it is left blank for review.
- Duplicates default to draft with `isPublished=false`, `publishedAt=null`, and `includeInSitemap=false`.

## Publish/Unpublish Behavior

The page list now has a Publish or Unpublish action per row.

Publish behavior:

- Sets `isPublished=true`.
- Sets `includeInSitemap=true`.
- Sets `publishedAt` if the page did not already have one.
- Preserves content, SEO, tenant ID, and page identity.

Unpublish behavior:

- Sets `isPublished=false`.
- Sets `includeInSitemap=false`.
- Does not delete content.
- Keeps the page available to admin view/edit routes.

Both actions use the existing authenticated tenant-scoped update endpoint.

## Archive/Unarchive Decision

Archive/unarchive was not implemented because the current Page model does not contain an archive/status field.

The admin list shows a disabled Archive action with an explanation:

- Archive requires a first-class archive/status field.
- Use Unpublish for this MVP.

This avoids inventing a risky ad hoc schema field during the lifecycle phase.

## Validation Rules

Implemented in admin UI:

- Slug is required.
- Slug is normalized for create/duplicate.
- New slugs must not collide with existing pages in the selected tenant.
- Title is required.
- Tenant ID is not editable.
- Page IDs are generated safely from selected tenant and normalized slug.
- Duplicates cannot overwrite source pages.
- Duplicate canonical URL is updated or cleared for review.

Implemented in API:

- Create/update require a slug.
- Create/update reject request-body tenant mismatches.
- Create/update reject same-tenant slug collisions.

## Tenant Safety Notes

- Page list data is loaded only for the selected tenant.
- Create uses `currentTenant.tenantId`.
- Duplicate uses the selected tenant and rewrites `tenantId`, `id`, `PageId`, and `pageSlug`.
- Publish/unpublish uses the selected tenant and original page slug.
- Existing API JWT/SuperAdmin tenant rules still apply.
- No tenant API keys are used or exposed in the browser.

## Runtime Verification Results

Local targets used:

- Pumpkin API: `http://localhost:5064`
- Admin app: `http://localhost:3001`
- Public ice frontend: `http://localhost:3002`

Runtime checks passed:

- Logged in to admin.
- Created an ice draft page: `phase-3-draft-test-51412237`.
- Confirmed the created draft appeared in the page list as Draft and Hidden.
- Confirmed the created draft opened in the admin read-only detail view.
- Confirmed the public frontend did not show the unpublished draft page title.
- Duplicated the ice home page into draft: `phase-3-duplicate-test-51412237`.
- Confirmed duplicate defaulted to Draft and Hidden.
- Published the duplicate and confirmed it became Published and Included.
- Unpublished the duplicate and confirmed it became Draft and Hidden.
- Republished the duplicate and confirmed it became Published and Included.
- Switched to `roller-rink-rentals`.
- Duplicated the roller home page into draft: `roller-phase-3-duplicate-test-51412237`.
- Confirmed the roller duplicate defaulted to Draft and Hidden.
- Confirmed the Phase 2 structured edit route still loads for the ice home page.

Local test data note:

- The Phase 3 runtime test created local Cosmos pages and did not remove them because hard delete is intentionally unavailable in this phase.

## Checks Run

Passed:

- `npm run type-check` from `apps/admin`
- `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/[id]/edit/page.tsx" "src/app/dashboard/pages/[id]/view/page.tsx"` from `apps/admin`
- `dotnet build` from `apps/pumpkin-api`
- `git diff --check`
- Runtime browser verification for create, duplicate, publish/unpublish, and tenant switching

Notes:

- `dotnet build` initially could not copy a DLL because the local Pumpkin API process was running and locking the file. The local API process was stopped, build passed, and the API was restarted on `http://localhost:5064`.
- `git diff --check` passed with only Git line-ending notices on touched files.
- A diff-only sensitive-value pattern scan returned no matches.

## Known Limitations

- No hard delete is exposed.
- Archive/unarchive is not implemented until the Page model gets a first-class archive/status field.
- Create templates are intentionally minimal.
- Publish/unpublish does not rewrite SEO robots values.
- The Phase 2 edit route still relies on API rejection for slug collisions during manual slug edits.
- No revision snapshots or rollback UI yet.
- No import/export.
- No static export publishing.
- Public draft preview is not a true preview mode; draft public routes may 404 until published.

## Next Recommended Phase

Proceed to Phase 4: JSON import/export foundation.

Recommended next focus:

- Export tenant pages to portable JSON.
- Import JSON with dry-run validation.
- Diff proposed JSON changes against existing tenant pages.
- Support create-only, update-only, and upsert modes.
- Keep CSV/XLSX and static publishing for later phases.
