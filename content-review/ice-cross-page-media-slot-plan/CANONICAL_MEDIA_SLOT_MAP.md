# Canonical Media Slot Map

The map below uses one canonical MediaAsset per image where reuse is appropriate. Page-specific meaning is handled through alt text, title, caption, purpose, tags, and usage type rather than by duplicating identical image files.

| Slot | Page | Route | Block/Section | Variant | Asset | MediaAsset ID | Current or planned source path | New upload needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| homepageHeroImage | Homepage | / | homepage-hero-media | heroMedia | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | $.ContentData.ContentBlocks[0].content.media | no |
| homepageCorporateUseCaseImage | Homepage | / | homepage-corporate-vip-split-feature | splitFeature | Corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | $.ContentData.ContentBlocks[6].content.media | no |
| homepageHolidayUseCaseImage | Homepage | / | homepage-public-holiday-split-feature | splitFeature | Holiday/shopping center | ice-rink-rentals-holidayicerink-973ce7691377 | $.ContentData.ContentBlocks[7].content.media | no |
| homepageSetupLogisticsImage | Homepage | / | homepage-rental-options-split-feature | splitFeature | Setup/logistics | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | $.ContentData.ContentBlocks[5].content.media | no |
| homepagePpecPartnerLogo | Homepage | / | homepage-ppec-partner-strip | trustBand | PPEC logo | ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae | $.ContentData.ContentBlocks[1].content.partner.logoMedia | no |
| homepageOpenGraphImage | Homepage | / | page seo/media | openGraphImage | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | $.media.openGraphImage and $.seo.openGraph | no |
| contactHeroImage | Contact | /contact | contact-hero-media | heroMedia | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | $.ContentData.ContentBlocks[0].content.media in validated candidate; $.media.heroImage in readback | no |
| contactQuotePlanningImage | Contact | /contact | contact-quote-context | splitFeature | Setup/logistics | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | $.ContentData.ContentBlocks[2].content.media in validated candidate; $.media.setupImage in candidate | no |
| contactSupportImage | Contact | /contact | contact-event-types | event-card-grid | Multiple official assets | corporate/holiday/setup, depending card | $.ContentData.ContentBlocks[5].content.cards[*].media in validated candidate | no |
| contactOpenGraphImage | Contact | /contact | page seo/media | openGraphImage | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | $.media.openGraphImage in candidate; $.media.openGraphImage URL in readback | no |
| contactPpecPartnerLogo | Contact | /contact | contact-partner-referral | trustBand | PPEC logo | ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae | Not currently present as image | no - optional reuse only |
| serviceAreasHeroImage | Service Areas | /service-areas | service-areas-hero | heroMedia | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | $.ContentData.ContentBlocks[0].content.media and $.media.heroImage | no |
| serviceAreasCoverageImage | Service Areas | /service-areas | page media/local coverage | localImage | Corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | $.media.localImage | no |
| serviceAreasSetupImage | Service Areas | /service-areas | setup-logistics-feature | splitFeature | Setup/logistics | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | $.ContentData.ContentBlocks[4].content.media and $.media.setupImage | no |
| serviceAreasCorporateImage | Service Areas | /service-areas | service-area-use-cases | mediaUseCaseGrid | Corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | $.ContentData.ContentBlocks[6].content.cards[1].media | no |
| serviceAreasHolidayImage | Service Areas | /service-areas | service-area-use-cases | mediaUseCaseGrid | Holiday/shopping center | ice-rink-rentals-holidayicerink-973ce7691377 | $.ContentData.ContentBlocks[6].content.cards[0].media and $.media.closingImage | no |
| serviceAreasOpenGraphImage | Service Areas | /service-areas | page seo/media | openGraphImage | Winter/hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | $.media.openGraphImage and $.seo.openGraph | no |
| serviceAreasFinalCtaImage | Service Areas | /service-areas | service-areas-final-cta | finalCta | Holiday/shopping center | ice-rink-rentals-holidayicerink-973ce7691377 | No block-level media slot; recommended fallback is $.media.closingImage if renderer later supports image | no - optional fallback only |

## Approved MediaAssets Reused

- Ice Rink Rentals logo: `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` at `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png`
- Winter/hero: `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` at `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png`
- Corporate: `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` at `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png`
- Holiday/shopping center: `ice-rink-rentals-holidayicerink-973ce7691377` at `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png`
- Setup/logistics: `ice-rink-rentals-icerinkrentalssetup-113d218572e4` at `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png`
- PPEC logo: `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` at `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png`

## New MediaAsset Requirements

No required current slot needs a new upload. If future design work adds a contact PPEC logo or a service-areas final CTA image, the plan is to reuse existing assets first.
