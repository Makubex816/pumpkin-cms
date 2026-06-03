# Service Areas Media Slot Plan

Sources:

- Candidate: `content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json`
- Import package: `content-review/ice-service-areas-validated/SERVICE_AREAS_IMPORT_PACKAGE.json`

The normalized `/service-areas` candidate is already bound to the approved official MediaAssets. This run does not import it and does not create a patched media-bound candidate because the required media bindings are already present.

| Slot | Section | Variant | Asset reused | MediaAsset ID | Purpose | Action |
| --- | --- | --- | --- | --- | --- | --- |
| serviceAreasHeroImage | service-areas-hero | heroMedia | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | Visible service-areas hero image | No write; reuse asset |
| serviceAreasCoverageImage | page media/local coverage | localImage | Corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | Coverage/local planning supporting image | No write; reuse asset |
| serviceAreasSetupImage | setup-logistics-feature | splitFeature | Setup/logistics | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | Visible setup logistics feature image | No write; reuse asset |
| serviceAreasCorporateImage | service-area-use-cases | mediaUseCaseGrid | Corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | Corporate/brand activation use-case card | No write; reuse asset |
| serviceAreasHolidayImage | service-area-use-cases | mediaUseCaseGrid | Holiday/shopping center | ice-rink-rentals-holidayicerink-973ce7691377 | Holiday/winter attraction use-case card and closing page media | No write; reuse asset |
| serviceAreasOpenGraphImage | page seo/media | openGraphImage | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | Open Graph/social image; not visible in page body | No write; reuse asset |
| serviceAreasFinalCtaImage | service-areas-final-cta | finalCta | Holiday/shopping center | ice-rink-rentals-holidayicerink-973ce7691377 | Optional final CTA visual fallback | no - optional fallback only |

## Service-Areas Notes

- Service-areas media-ready: yes for local draft import planning.
- Service-areas ready for local draft import after media plan: yes, based on existing normalized candidate bindings and previous preflight artifacts.
- The service-area PPEC block is text-only and does not need the PPEC logo asset.
- The final CTA has no block-level image slot. If a visual CTA is introduced later, reuse the page-level `closingImage` holiday asset unless a genuinely different image is required.
- Static/production media-ready remains no until the Azure Blob/Cloudflare media path exists and is verified.
