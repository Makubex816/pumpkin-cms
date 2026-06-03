# Pumpkin Ice Cross-Page Media Slot Plan Report

Generated: 2026-06-03T20:54:23.205Z

## Scope

- Primary site: IceSkatingRinkRentals.com
- Routes reviewed: `/`, `/contact`, `/service-areas`
- Output folder: `content-review/ice-cross-page-media-slot-plan/`
- Planning only: yes

## Starting State

- Git status at start showed only the existing untracked service-area input ZIP and extracted reference package files.
- Latest branch history reviewed with `git log --oneline -12`.
- Homepage `/` is approved and live in CMS.
- `/contact` exists and was not changed.
- `/service-areas` is normalized/validated but was not imported.

## Files Changed

- Created/updated cross-page media slot plan docs in `content-review/ice-cross-page-media-slot-plan/`.
- Created/updated this root report: `PUMPKIN_ICE_CROSS_PAGE_MEDIA_SLOT_PLAN_REPORT.md`.
- No CMS records, Theme records, MediaAsset records, image files, static packages, deployment files, DNS/email/provider settings, protected config, or Roller files were changed.

## Pages Reviewed

| Page | Route | Primary source |
| --- | --- | --- |
| Homepage | / | content-review/ice-approved-homepage-live-cms-promotion/homepage-readback-after-live-cms-promotion.json |
| Contact | /contact | content-review/ice-updated-home-contact-local-draft-import/contact-readback-after-import.json; canonical candidate content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json |
| Service Areas | /service-areas | content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json |

## Media Slots Found

| Page | Canonical slot count | Media-ready |
| --- | --- | --- |
| Homepage | 6 | yes |
| Contact | 5 | yes |
| Service Areas | 7 | yes |

## Existing MediaAssets Reused

- `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` - Ice Rink Rentals logo
- `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` - Winter/hero
- `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` - Corporate
- `ice-rink-rentals-holidayicerink-973ce7691377` - Holiday/shopping center
- `ice-rink-rentals-icerinkrentalssetup-113d218572e4` - Setup/logistics
- `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` - PPEC logo

## Missing Media Requirements

- No current required media slot needs a new upload.
- Homepage has non-rendering nested card media stubs that remain empty and non-blocking.
- Contact readback omits some page-level `mediaAssetId` fields while preserving `assetId`/`publicUrl`; reconfirm before any later contact production promotion.
- Service-areas final CTA has no block-level image slot; page-level `closingImage` is available as a reuse fallback if needed later.
- Static/production media readiness remains blocked until Azure Blob/Cloudflare media path is available and verified.

## Placeholder/Null Media Blockers

- Required local-draft media blockers: none.
- New-upload blockers: none.
- Wrong/old PPEC logo ID in current homepage source: none found.
- Raw/external/base64 media embedded in service-areas candidate: none reported by existing media review.

## Readiness Classification

| Readiness item | Result |
| --- | --- |
| Homepage media-ready | yes |
| Contact media-ready | yes |
| Service-areas media-ready | yes |
| Service-areas ready for local draft import after media plan | yes |
| Static/production media-ready | no until Azure Blob/Cloudflare media path exists |

## Validation Results

Validation status: completed-local-only

| Validation | Result | Notes |
| --- | --- | --- |
| JSON parse validation | pass | Generated JSON parsed successfully. |
| Changed MJS syntax check | pass | `node --check` passed for the generated runner. |
| Media validation | pass | Media fixture validator returned `ok: true` with non-blocking fixture warnings. |
| Service-areas local import preflight | pass for local draft | Existing normalized candidate has no localDraftImport blockers; CMS/static/production blockers remain intentional. |
| Design-system validation | not applicable | No page candidate changed in this planning run. |
| Tailwind/navigation validation | not applicable | No page candidate or frontend source changed in this planning run. |
| Unsafe HTML/CSS/form/media/email scan | pass via preflight | Service-areas import preflight found no unsafe payload markers. |
| Targeted secret scan | pass | No high-confidence secret/JWT/token hits in generated outputs. |
| `git diff --check` | pass | No diff whitespace errors. |
| Trailing whitespace scan | pass | No trailing whitespace in generated output/report files. |
| Protected/generated/raw artifact path check | pass | No protected paths or raw/generated media artifacts introduced. |
| ZIP/raw/extracted staged check | pass | Nothing staged; no ZIPs, raw media, or extracted inputs staged. |

Detailed validation notes are in `content-review/ice-cross-page-media-slot-plan/VALIDATION_RESULTS.md`.

## Next Recommended Action

User approval can move the already-normalized `/service-areas` candidate into a controlled local draft import. Keep static/production media publishing paused until the cloud media path is verified.
