# Pumpkin Ice Contact Draft Preview Support Report

Generated: 2026-06-04

## Scope

Primary site: IceSkatingRinkRentals.com.

Added local draft preview support for `/contact` only. No CMS records were updated, `/contact` was not published, and no homepage, `/service-areas`, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, email sending, or Roller action occurred.

## Start

Branch: `feature/admin-page-editor-import-export`

Git status at start:

```text
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/assets/CorporateIceRinkRentalEvent.png
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/assets/HolidayIceRink.png
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/assets/IceRinkRentalsSetup.png
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/assets/IceSkatingRinkRentalsLogo.png
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/assets/WinterFestIceRinkRentals.png
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/assets/ppec-wordmark-card-preview.png
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.content.json
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.forms-routing.json
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.full.json
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.media-manifest.json
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.preview.html
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.schema.json
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/docs/ice-contact-page.phase9e.source-rewrite-summary.md
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/docs/ice-contact-page.phase9e.visual-pumpkin-rewrite.import-notes.md
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/docs/ice-contact-page.phase9e.visual-pumpkin-rewrite.validation-notes.md
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/shared/ice-rink-rentals.contact-form-block.phase9e.json
?? content-review/ice-final-contact-input/ice-contact-page-phase9e-visual-pumpkin-rewrite.zip
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/assets/corporate.webp
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/assets/hero.webp
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/assets/holiday.webp
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/assets/logo.png
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/assets/setup.webp
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/docs/ice-service-areas.phase11b.image-plan.md
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/docs/ice-service-areas.phase11b.import-notes.md
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/docs/ice-service-areas.phase11b.validation-notes.md
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/service-areas/ice-service-areas.phase11b.production-polish.content.json
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/service-areas/ice-service-areas.phase11b.production-polish.forms-routing.json
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/service-areas/ice-service-areas.phase11b.production-polish.full.json
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/service-areas/ice-service-areas.phase11b.production-polish.media-manifest.json
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/service-areas/ice-service-areas.phase11b.production-polish.preview.html
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/service-areas/ice-service-areas.phase11b.production-polish.schema.json
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/shared/ice-rink-rentals.service-area-shared-refs.json
?? content-review/ice-service-areas-input/ice-service-areas-phase11b-production-polish.zip
```

Recent log:

```text
af471be Add Ice final contact local draft import report
8d66530 Add Ice final contact package intake
aa556a9 Add Ice service areas region grid polish report
9f2dbd2 Add Ice service areas live CMS promotion report
96d48cb Add Ice service areas polish report
2fa65d2 Add Ice service areas draft preview support
42f4c0c Add Ice service areas local draft import report
db145dd Add Ice cross page media slot plan
a730b49 Add Ice service areas package intake
ee8cade Finalize Ice import preflight and fallback theme updates
9c2c42a Add Ice approved homepage live CMS promotion report
d61e83d Update Ice PPEC first banner copy
```

Starting state was clean except the known raw contact and service-area input artifacts.

## Files Changed

- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/contact/page.tsx`
- `apps/ice-rink-web/next.config.js`
- `content-review/ice-contact-draft-preview-support/README.md`
- `content-review/ice-contact-draft-preview-support/DRAFT_PREVIEW_ROUTE.md`
- `content-review/ice-contact-draft-preview-support/CONTACT_PREVIEW_BEHAVIOR.md`
- `content-review/ice-contact-draft-preview-support/FORM_PREVIEW_NOTES.md`
- `content-review/ice-contact-draft-preview-support/PREVIEW_SECURITY_NOTES.md`
- `content-review/ice-contact-draft-preview-support/FRONTEND_REVIEW_CHECKLIST.md`
- `content-review/ice-contact-draft-preview-support/manifest.json`
- `PUMPKIN_ICE_CONTACT_DRAFT_PREVIEW_SUPPORT_REPORT.md`

## Preview Route Added

Actual route:

- `http://localhost:3002/draft-preview/ice-rink-rentals/contact`

Alias/rewrite:

- `http://localhost:3002/__preview/ice-rink-rentals/contact`

The route reuses the shared Ice draft preview client and requires browser admin JWT entry before fetching the admin draft page.

## Public Contact Behavior

Public `/contact` remains separate from draft preview support.

Probe result:

- `http://localhost:3002/contact` returned HTTP 200.

No public route file was changed.

## Draft Preview Behavior

Probe results:

- `http://localhost:3002/__preview/ice-rink-rentals/contact` returned HTTP 200.
- `http://localhost:3002/draft-preview/ice-rink-rentals/contact` returned HTTP 200.

The HTTP probe confirms the preview shell and alias are served. Loading the actual CMS draft in-browser still requires pasting a local admin JWT into the preview form, matching the existing homepage and service-area preview flow.

## Form Preview Notes

The prior final contact local draft readback verified:

- `formBlock` present.
- `formKey` `default-quote-request`.
- `sourcePage` `/contact`.
- `staticEndpointRef` `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- `leadRecipientRef` `ICE_RINK_RENTALS_LEAD_RECIPIENT`.
- No raw CF7/WordPress runtime behavior.
- No real email sending enabled.

The preview renderer uses `staticFormEndpoint=""`, so this preview task does not enable real form delivery.

## Validation Results

- `npm run type-check` in `apps/ice-rink-web`: passed.
- `node --check apps/ice-rink-web/next.config.js`: passed.
- Preview alias probe: HTTP 200.
- Actual preview route probe: HTTP 200.
- Public `/contact` probe: HTTP 200.
- CMS writes: none.
- Static generation: none.
- Deployment: none.
- Protected config touched: no.

- `git diff --check`: passed.
- Trailing whitespace scan: passed.
- Protected/generated/raw artifact path check: passed, with only the known raw input artifacts under `content-review/ice-final-contact-input/` and `content-review/ice-service-areas-input/`.
- Targeted secret scan: passed.
- Staged artifact check: passed; no files are staged.

## Next Recommended Action

Open `http://localhost:3002/__preview/ice-rink-rentals/contact`, paste a local admin JWT in the preview form, and visually review the final contact draft before any separate live CMS promotion or static generation decision.
