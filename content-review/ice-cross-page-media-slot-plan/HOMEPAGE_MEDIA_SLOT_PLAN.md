# Homepage Media Slot Plan

Source: `content-review/ice-approved-homepage-live-cms-promotion/homepage-readback-after-live-cms-promotion.json`

The homepage is already approved and live in CMS. This run does not update `/`; it only records the current approved bindings and the recommended canonical slot names.

| Slot | Section | Variant | Asset reused | MediaAsset ID | Purpose | Action |
| --- | --- | --- | --- | --- | --- | --- |
| homepageHeroImage | homepage-hero-media | heroMedia | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | Visible hero image | No write; reuse asset |
| homepageCorporateUseCaseImage | homepage-corporate-vip-split-feature | splitFeature | Corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | Corporate/VIP split feature and related use-case card | No write; reuse asset |
| homepageHolidayUseCaseImage | homepage-public-holiday-split-feature | splitFeature | Holiday/shopping center | ice-rink-rentals-holidayicerink-973ce7691377 | Public holiday split feature and related use-case card | No write; reuse asset |
| homepageSetupLogisticsImage | homepage-rental-options-split-feature | splitFeature | Setup/logistics | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | Rental options/setup logistics feature | No write; reuse asset |
| homepagePpecPartnerLogo | homepage-ppec-partner-strip | trustBand | PPEC logo | ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae | Partner logo in first PPEC partner banner | No write; reuse asset |
| homepageOpenGraphImage | page seo/media | openGraphImage | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | Open Graph/social image; not visible in page body | No write; reuse asset |

## Homepage Notes

- Homepage media-ready: yes for the approved/live CMS page.
- PPEC logo binding is the approved PPEC logo MediaAsset `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae`.
- The partner banner uses the existing renderer/CSS contrast repair; this plan does not change colors, layout, copy, CTA behavior, image files, or MediaAssets.
- Empty nested card media stubs remain non-blocking because the visible split-feature and hero media slots are already bound to official assets.
- Static/production media-ready remains no until the Azure Blob/Cloudflare media path exists and is verified.
