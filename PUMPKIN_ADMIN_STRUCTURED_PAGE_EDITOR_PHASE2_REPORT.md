# Pumpkin Admin Structured Page Editor Phase 2 Report

## Executive Summary

Phase 2 added a safe structured editor for existing Pumpkin CMS Page documents. The editor is tenant-scoped, uses the existing authenticated admin page update endpoint, preserves unsupported blocks, and avoids create, duplicate, archive, hard delete, import/export, static export, and drag-and-drop behavior.

Runtime verification succeeded locally for the existing CMS-backed flow:

- Ice homepage opened from read-only detail into the editor.
- A harmless Hero headline edit saved successfully.
- The authenticated admin API returned the updated value.
- The read-only page detail view showed the updated value.
- The public ice frontend reflected the updated value after refresh.
- The original headline was restored after verification.
- Roller homepage editor loaded under `roller-rink-rentals`.
- Roller public frontend rendered expected tenant content.

No secrets were added to files or this report.

## Files Changed

- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
  - Added the Phase 2 structured editor route.
- `apps/admin/src/app/dashboard/pages/page.tsx`
  - Added an Edit action beside View and Preview.
  - Updated the phase banner to describe Phase 2 behavior.
- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
  - Added an Edit button from the read-only detail page.
  - Updated the phase banner to point admins to the structured editor.
- `PUMPKIN_ADMIN_STRUCTURED_PAGE_EDITOR_PHASE2_REPORT.md`
  - Added this report.

## Endpoints Used Or Added

No API endpoints were added in Phase 2.

The editor uses existing authenticated admin endpoints:

- `GET /api/admin/pages?tenantId={tenantId}`
- `GET /api/admin/pages/{tenantId}/{pageSlug}`
- `PUT /api/admin/pages/{tenantId}/{pageSlug}`

Existing auth endpoints remain in use:

- `POST /api/auth/login`
- `GET /api/auth/verify`
- `POST /api/auth/logout`

## Editor Route

Primary route:

- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- Runtime URL pattern: `/dashboard/pages/{pageSlug}/edit?tenantId={tenantId}`

The route loads the selected page by tenant and original slug, keeps tenant and document identifiers locked, and saves through the existing `PUT` endpoint.

## Fields Supported

General Page fields:

- `MetaData.title`
- `MetaData.description`
- `pageSlug`
- `isPublished`
- `includeInSitemap`

SEO fields:

- `seo.metaTitle`
- `seo.metaDescription`
- `seo.robots`
- `seo.canonicalUrl`

Locked/read-only identifiers:

- `tenantId`
- `PageId`
- `id`
- original route slug used for save lookup

## Block Types Supported

Structured editors were added for:

- `Hero`
- `TrustBar`
- `CardGrid`
- `HowItWorks`
- `FAQ`
- `PrimaryCTA`
- `Contact`

Supported visible text/link/form/image fields include:

- Hero headline, subheadline, buttons, background image, main image, and alt text.
- TrustBar item icon, title, text, and alt.
- CardGrid section title, subtitle, layout, card title, description, icon, link, image, image-alt, and alt.
- HowItWorks title, step title, text, image, and alt.
- FAQ title, subtitle, layout, question, and answer.
- PrimaryCTA title, description, buttons, secondary link fields, background image, main image, and alt.
- Contact title, subtitle, address, phone, email, hours, submit button text, and form field label/type/required/placeholder.

## Image Field Handling

The editor surfaces image-slot awareness using existing block fields:

- Hero image slot: detected from `Hero` image and alt fields.
- Dynamic/local rink image slot: detected from blocks such as `CardGrid`, `HowItWorks`, `Gallery`, `LocalProTips`, `ServiceAreaMap`, and `Testimonials` when present.
- Closing image slot: detected from `PrimaryCTA`, `SecondaryCTA`, and `Contact` image-like fields when present.

Dedicated page-level image slot fields are not modeled yet. Phase 2 does not invent a new destructive data model; it edits only existing image fields safely.

## Unknown Block Preservation

Unsupported block types render as read-only JSON panels.

Save preparation preserves unsupported blocks exactly because the editor only rewrites known supported block content. This prevents accidental block loss while still allowing known visible text and SEO fields to be edited.

## Validation Behavior

Implemented light validation:

- `pageSlug` is required.
- `pageSlug` is normalized on save.
- `seo.canonicalUrl` is optional, but must be an `http` or `https` URL when present.
- `ContentData.ContentBlocks` must remain an array.
- Known block array fields must remain arrays.
- Empty `MetaData.title` and `seo.metaTitle` show warnings.
- FAQ question/answer and Contact form field values are sanitized to avoid saving `undefined`.
- Form field `required` is preserved as a boolean.

Known validation gap:

- Slug uniqueness is not preflighted in the admin UI yet.

## Tenant Safety

Tenant context is resolved from the route query, current tenant selection, or authenticated user tenant. The editor:

- Does not allow `tenantId` editing.
- Loads pages through tenant-scoped admin endpoints.
- Blocks saving if the loaded page tenant does not match the selected tenant.
- Relies on JWT authorization and the existing API SuperAdmin tenant-access rules.

## Runtime Verification Result

Local targets used:

- Pumpkin API: `http://localhost:5064`
- Admin app: `http://localhost:3001`
- Public ice frontend: `http://localhost:3002`
- Public roller frontend: `http://roller.localhost:3002`

Verified:

- Admin login worked with the existing local seeded admin user.
- Ice read-only detail opened the new Edit route.
- Ice Hero headline edit saved successfully.
- Ice API, read-only detail, and public frontend showed the updated headline.
- The original ice headline was restored after the test.
- Roller editor loaded for `roller-rink-rentals`.
- Roller public frontend rendered expected content.

Runtime testing was limited to local data. The save/restore cycle increments local page metadata such as version/updated timestamp as normal admin testing side effects.

## Checks Run

Passed:

- `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/[id]/view/page.tsx" "src/app/dashboard/pages/[id]/edit/page.tsx"` from `apps/admin`
- `git diff --check`
- Browser runtime verification with local API, admin, and public frontends

Ran with existing unrelated failures:

- `npm run type-check` from `apps/admin`
  - Fails in existing `src/app/dashboard/themes/[id]/page.tsx` implicit-any errors.
  - No Phase 2 page editor type errors were surfaced before the unrelated theme editor failures.

Not run:

- `dotnet build`, because Phase 2 did not change API code.

## Known Limitations

- No create page flow.
- No duplicate page flow.
- No archive flow.
- No hard delete.
- No import/export.
- No static export publishing.
- No drag-and-drop.
- No block add/remove/reorder in the Phase 2 editor.
- No revision history or rollback UI yet.
- No slug uniqueness preflight before save.
- Dedicated page-level hero/local/closing image slots are still a future data-model decision.
- The older `/dashboard/pages/[id]` route still exists and was not refactored in this phase.
- Full admin type-check remains blocked by pre-existing theme editor issues.

## Next Recommended Phase

Proceed to Phase 3: create/duplicate/unpublish/archive foundation, but keep it soft-delete oriented and tenant-scoped.

Recommended Phase 3 priorities:

- Add slug uniqueness validation before pageSlug changes.
- Add duplicate-page flow that requires a new slug and title.
- Add explicit publish/unpublish controls around the existing `isPublished` field.
- Add soft archive, not hard delete.
- Add basic revision snapshots before save.
- Keep import/export and static publishing out until the edit/create lifecycle is safer.
