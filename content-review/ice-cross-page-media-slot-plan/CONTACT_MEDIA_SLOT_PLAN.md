# Contact Media Slot Plan

Sources:

- Readback: `content-review/ice-updated-home-contact-local-draft-import/contact-readback-after-import.json`
- Validated candidate: `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json`

This run does not update `/contact`. The plan uses the validated candidate as the canonical MediaAsset-ID source and the readback/visual QA artifacts as the current local-render evidence.

| Slot | Section | Variant | Asset reused | MediaAsset ID | Purpose | Action |
| --- | --- | --- | --- | --- | --- | --- |
| contactHeroImage | contact-hero-media | heroMedia | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | Hero/featured contact image | No write; reuse asset |
| contactQuotePlanningImage | contact-quote-context | splitFeature | Setup/logistics | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | Quote planning/setup context image | No write; reuse asset |
| contactSupportImage | contact-event-types | event-card-grid | Multiple existing assets | See card-specific existing assets | Event-type support card media | No write; reuse asset |
| contactOpenGraphImage | page seo/media | openGraphImage | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | Open Graph/social image; not visible in page body | No write; reuse asset |
| contactPpecPartnerLogo | contact-partner-referral | trustBand | PPEC logo | ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae | Only needed if the contact PPEC callout gains a logo image | no - optional reuse only |

## Contact Notes

- Contact media-ready: yes for the validated contact candidate and current local render evidence.
- The contact CMS readback keeps page-level `assetId` and `publicUrl` values but omits `mediaAssetId` on some page-level media fields. Treat that as a production-readiness check before any later contact promotion.
- The contact PPEC/support callout is text-only. If a logo is later added, reuse `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae`; do not upload a duplicate.
- No contact CMS write, import, MediaAsset update, or content change is included in this package.
- Static/production media-ready remains no until the Azure Blob/Cloudflare media path exists and is verified.
