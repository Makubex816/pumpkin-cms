# Body Media URL Blocker Audit

Generated: 2026-06-04

## Scope

This audit maps the remaining local `/media/ice-rink-rentals/...` strict validator findings to active Ice CMS snapshot fields.

No CMS records, MediaAsset records, or media files were changed. No media was uploaded.

## Validator Behavior

The strict validators emit one local-dev media URL error per rendered text file that contains one or more local media URLs.

Current file-level failures:

| Route | Files | Unique local media URLs |
| --- | --- | ---: |
| `/` | `index.html`, `index.txt` | 6 |
| `/contact` | `contact/index.html`, `contact/index.txt` | 8 |
| `/service-areas` | `service-areas/index.html`, `service-areas/index.txt` | 6 |

The local media URLs appear in rendered body/section imagery and page media objects. They are not the previously cleared Open Graph/Twitter metadata image fields.

## Home Route Sources

Rendered files: `index.html`, `index.txt`.

| URL | MediaAsset ID in active snapshot | Source field/path examples | Visible imagery impact if cleared |
| --- | --- | --- | --- |
| `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `page.ContentData.ContentBlocks[0].content.media.publicUrl`, `page.ContentData.ContentBlocks[2].content.cards[0].media.publicUrl`, `page.media.heroImage.publicUrl`, `page.media.featuredImage.publicUrl` | removes hero/card/page imagery |
| `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `page.ContentData.ContentBlocks[2].content.cards[1].media.publicUrl`, `page.ContentData.ContentBlocks[6].content.media.publicUrl`, `page.media.localImage.publicUrl`, `page.media.corporate.publicUrl` | removes service/card/section imagery |
| `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` | `ice-rink-rentals-holidayicerink-973ce7691377` | `page.ContentData.ContentBlocks[2].content.cards[2].media.publicUrl`, `page.ContentData.ContentBlocks[7].content.media.publicUrl`, `page.media.closingImage.publicUrl`, `page.media.holiday.publicUrl` | removes service/card/closing imagery |
| `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png` | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `page.ContentData.ContentBlocks[5].content.media.publicUrl`, `page.media.setupImage.publicUrl`, `page.media.setup.publicUrl` | removes setup/process imagery |
| `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `page.media.logo.publicUrl` | removes logo imagery |
| `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `page.ContentData.ContentBlocks[1].content.partner.logoMedia.publicUrl`, `page.ContentData.ContentBlocks[9].content.partner.logoMedia.publicUrl`, `page.media.ppecPartnerLogo.publicUrl` | removes partner/logo imagery |

## Contact Route Sources

Rendered files: `contact/index.html`, `contact/index.txt`.

| URL | MediaAsset ID in active snapshot | Source field/path examples | Visible imagery impact if cleared |
| --- | --- | --- | --- |
| `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `page.ContentData.ContentBlocks[0].content.mainImage`, `page.ContentData.ContentBlocks[0].content.media.publicUrl`, `page.media.contactHeroImage.publicUrl`, `page.media.featuredImage.publicUrl` | removes contact hero imagery |
| `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `page.ContentData.ContentBlocks[2].content.media.publicUrl`, `page.ContentData.ContentBlocks[2].content.imageUrl`, `page.media.contactQuotePlanningImage.publicUrl` | removes quote/planning imagery |
| `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `page.ContentData.ContentBlocks[6].content.media.publicUrl`, `page.ContentData.ContentBlocks[6].content.imageUrl`, `page.media.contactSetupLogisticsImage.publicUrl` | removes setup/logistics imagery |
| `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `page.ContentData.ContentBlocks[7].content.cards[0].media.publicUrl` | removes card imagery |
| `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `page.ContentData.ContentBlocks[7].content.cards[1].media.publicUrl`, `page.media.localImage.publicUrl` | removes card/page imagery |
| `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` | `ice-rink-rentals-holidayicerink-973ce7691377` | `page.ContentData.ContentBlocks[7].content.cards[2].media.publicUrl`, `page.media.closingImage.publicUrl` | removes card/closing imagery |
| `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `page.media.logo.publicUrl` | removes logo imagery |
| `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `page.ContentData.ContentBlocks[8].content.partner.logoMedia.publicUrl`, `page.media.contactPpecPartnerLogo.publicUrl` | removes partner/logo imagery |

## Service Areas Route Sources

Rendered files: `service-areas/index.html`, `service-areas/index.txt`.

| URL | MediaAsset ID in active snapshot | Source field/path examples | Visible imagery impact if cleared |
| --- | --- | --- | --- |
| `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `page.ContentData.ContentBlocks[0].content.media.publicUrl`, `page.ContentData.ContentBlocks[6].content.cards[2].media.publicUrl`, `page.media.heroImage.publicUrl`, `page.media.featuredImage.publicUrl` | removes hero/card/page imagery |
| `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `page.ContentData.ContentBlocks[6].content.cards[1].media.publicUrl`, `page.media.localImage.publicUrl` | removes card/page imagery |
| `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` | `ice-rink-rentals-holidayicerink-973ce7691377` | `page.ContentData.ContentBlocks[6].content.cards[0].media.publicUrl`, `page.media.closingImage.publicUrl` | removes card/closing imagery |
| `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png` | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `page.ContentData.ContentBlocks[4].content.media.publicUrl`, `page.media.setupImage.publicUrl` | removes setup/process imagery |
| `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `page.media.logo.publicUrl` | removes logo imagery |
| `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `page.ContentData.ContentBlocks[5].content.partner.logoMedia.publicUrl`, `page.media.ppecPartnerLogo.publicUrl` | removes partner/logo imagery |

## Diagnosis

The remaining media blocker is in body/content and page media objects, not metadata, navigation, theme CSS, or generated-only files.

Each rendered local URL maps to active snapshot media objects that carry an Ice `mediaAssetId`. The snapshot source values use local-dev public URLs, so the production-readiness repair is to publish or map these media assets to the approved production media origin:

```text
https://media.iceskatingrinkrentals.com
```

Clearing these fields would remove visible approved site imagery and is not a safe local-readiness repair.

## Policy Result

These media URLs should remain blockers until production media infrastructure and MediaAsset/public URL updates are explicitly approved.

Media production URL readiness: no.
