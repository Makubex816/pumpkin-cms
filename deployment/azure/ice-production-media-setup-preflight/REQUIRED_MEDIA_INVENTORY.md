# Required Media Inventory

Generated: 2026-06-04

## Source Evidence

This inventory is based on safe local documentation and repo-visible files:

- `deployment/azure/ice-static-dry-run-readiness/BODY_MEDIA_URL_BLOCKER_AUDIT.md`
- `deployment/azure/ice-production-media-setup-planning/MEDIA_ASSET_INVENTORY.md`
- `deployment/azure/ice-production-media-setup-planning/MEDIA_URL_TARGETS.md`
- repo-visible `.local-media` files under `apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/`

No live CMS or MediaAsset records were read. No protected config was read.

## Validator Blocker Summary

Strict validators currently report 6 file-level local body/media URL errors:

| Route | Rendered files | Unique local media URLs |
| --- | --- | ---: |
| `/` | `index.html`, `index.txt` | 6 |
| `/contact` | `contact/index.html`, `contact/index.txt` | 8 |
| `/service-areas` | `service-areas/index.html`, `service-areas/index.txt` | 6 |

The 6 errors are file-level failures. They map to 9 distinct MediaAsset-backed local media URLs.

## Required Media Items

| # | MediaAsset ID | Current local URL | Routes used | Source path examples | Approved visual purpose | Source availability | Proposed safe filename | Proposed target CDN URL | Missing before upload |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | `/`, `/contact`, `/service-areas` | `page.ContentData.ContentBlocks[0].content.media.publicUrl`; `page.media.heroImage.publicUrl`; `page.media.featuredImage.publicUrl` | Winter festival hero/card/page imagery | Present in `.local-media`; matching raw source also present | `winterfesticerinkrentals-324b1b89777d.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png` | Final approval of binary, alt text, dimensions, and upload path |
| 2 | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` | `/`, `/contact`, `/service-areas` | `page.ContentData.ContentBlocks[2].content.cards[1].media.publicUrl`; `page.media.localImage.publicUrl`; `page.media.corporate.publicUrl` | Corporate/VIP event service and card imagery | Present in `.local-media`; matching raw source also present | `corporateicerinkrentalevent-18e985ca59bd.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/corporateicerinkrentalevent-18e985ca59bd/18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d/corporateicerinkrentalevent-18e985ca59bd.png` | Final approval of binary, alt text, dimensions, and upload path |
| 3 | `ice-rink-rentals-holidayicerink-973ce7691377` | `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` | `/`, `/contact`, `/service-areas` | `page.ContentData.ContentBlocks[2].content.cards[2].media.publicUrl`; `page.media.closingImage.publicUrl`; `page.media.holiday.publicUrl` | Holiday/public-space card and closing imagery | Present in `.local-media`; matching raw source also present | `holidayicerink-973ce7691377.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/holidayicerink-973ce7691377/973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853/holidayicerink-973ce7691377.png` | Final approval of binary, alt text, dimensions, and upload path |
| 4 | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png` | `/`, `/service-areas` | `page.ContentData.ContentBlocks[5].content.media.publicUrl`; `page.media.setupImage.publicUrl`; `page.media.setup.publicUrl` | Setup/process and logistics imagery | Present in `.local-media`; matching raw source also present | `icerinkrentalssetup-113d218572e4.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/icerinkrentalssetup-113d218572e4/113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40/icerinkrentalssetup-113d218572e4.png` | Final approval of binary, alt text, dimensions, and upload path |
| 5 | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` | `/`, `/contact`, `/service-areas` | `page.media.logo.publicUrl` | Ice Rink Rentals logo imagery | Present in `.local-media`; matching raw source also present | `iceskatingrinkrentalslogo-0d1f970f0411.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/iceskatingrinkrentalslogo-0d1f970f0411/0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b/iceskatingrinkrentalslogo-0d1f970f0411.png` | Final approval of binary, alt text, dimensions, and upload path |
| 6 | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` | `/`, `/contact`, `/service-areas` | `page.ContentData.ContentBlocks[1].content.partner.logoMedia.publicUrl`; `page.media.ppecPartnerLogo.publicUrl` | Party Pros East Coast partner/logo imagery | Present in `.local-media`; original replacement source documented but current input file is missing | `partyproseastcoastlogo-cfd1fc9f60ae.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/partyproseastcoastlogo-cfd1fc9f60ae/cfd1fc9f60aee99c8d9c981f3eab7e7ce45d402343b9aa3bfa207f0dbb4e7582/partyproseastcoastlogo-cfd1fc9f60ae.png` | Confirm whether `.local-media` file may be used as source, or restore the documented original input |
| 7 | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | `/contact` | `page.ContentData.ContentBlocks[0].content.mainImage`; `page.media.contactHeroImage.publicUrl`; `page.media.featuredImage.publicUrl` | Contact hero imagery | Present in `.local-media`; matching raw source also present | `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd/841162071dfd3c5651f6111d3f6ed84354a8c60fc94a545e8648aea31f136b0a/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | Final approval of binary, alt text, dimensions, and upload path |
| 8 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | `/contact` | `page.ContentData.ContentBlocks[2].content.media.publicUrl`; `page.ContentData.ContentBlocks[2].content.imageUrl`; `page.media.contactQuotePlanningImage.publicUrl` | Contact quote/planning imagery | Present in `.local-media`; matching raw source also present | `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7/9ab697f5d9c704a3525382f0fbec020977053f592e2d1203998717e28badaa54/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | Final approval of binary, alt text, dimensions, and upload path |
| 9 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | `/contact` | `page.ContentData.ContentBlocks[6].content.media.publicUrl`; `page.ContentData.ContentBlocks[6].content.imageUrl`; `page.media.contactSetupLogisticsImage.publicUrl` | Contact setup/logistics imagery | Present in `.local-media`; matching raw source also present | `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d/40c9a505552d4cb278eb0912581d75566f0d717b97357c42934f0b59c2158120/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | Final approval of binary, alt text, dimensions, and upload path |

## Notes

The checksum segment in the proposed CDN URL is the lowercase SHA-256 hash observed from the local source/preflight file. A future execution task must re-hash the exact upload source immediately before upload and update the plan if any binary differs.

Media production URL readiness remains `no`.
