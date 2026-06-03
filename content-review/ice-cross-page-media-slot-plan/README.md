# Ice Cross-Page Media Slot Plan

Generated: 2026-06-03T20:54:23.205Z

This package is a local planning and validation audit for media reuse across IceSkatingRinkRentals.com homepage `/`, contact `/contact`, and the normalized `/service-areas` candidate. It does not import service areas, update CMS records, update MediaAsset records, regenerate static output, deploy, modify images, generate images, touch provider/DNS/email systems, or touch Roller.

## Sources Reviewed

| Key | Path | Present |
| --- | --- | --- |
| homepage | `content-review/ice-approved-homepage-live-cms-promotion/homepage-readback-after-live-cms-promotion.json` | yes |
| contactReadback | `content-review/ice-updated-home-contact-local-draft-import/contact-readback-after-import.json` | yes |
| contactCandidate | `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json` | yes |
| serviceAreas | `content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json` | yes |
| serviceAreasImportPackage | `content-review/ice-service-areas-validated/SERVICE_AREAS_IMPORT_PACKAGE.json` | yes |
| homepagePromotionReport | `content-review/ice-approved-homepage-live-cms-promotion/HOMEPAGE_READBACK_VERIFICATION.md` | yes |
| contactVisualQa | `content-review/ice-local-visual-qa/CONTACT_PREVIEW_MARKERS.md` | yes |
| serviceAreasMediaReview | `content-review/ice-service-areas-validated/MEDIA_BINDING_REVIEW.md` | yes |
| ppecLogoResult | `content-review/ice-ppec-logo-replacement/PPEC_LOGO_MEDIAASSET_RESULT.md` | yes |

## Outputs

- `PAGE_MEDIA_INVENTORY.md` - current page media usage and empty/media-stub observations.
- `CANONICAL_MEDIA_SLOT_MAP.md` - recommended canonical slot-to-MediaAsset map.
- `HOMEPAGE_MEDIA_SLOT_PLAN.md` - homepage-specific reuse plan.
- `CONTACT_MEDIA_SLOT_PLAN.md` - contact-specific reuse plan.
- `SERVICE_AREAS_MEDIA_SLOT_PLAN.md` - service-areas-specific reuse plan.
- `PAGE_SPECIFIC_ALT_TEXT.md` - slot-specific alt/title/caption/purpose metadata.
- `MEDIA_REUSE_DECISION.md` - reuse versus upload policy and result.
- `MISSING_MEDIA_REQUIREMENTS.md` - blockers, non-blocking stubs, and upload requirements.
- `IMPORT_READINESS_IMPACT.md` - readiness impact before service-area import.
- `manifest.json` - machine-readable summary.

## Planning Result

The current plan intentionally reuses the approved official MediaAssets. No new MediaAsset is required for the current homepage, contact, or service-areas page plans. The service-areas candidate is media-ready for a future local draft import, but static/production media readiness remains blocked until the Azure Blob/Cloudflare media path exists and is verified.
