# Imported Candidate Comparison

## Selected Candidate

The homepage local draft import report selected:

- content-review/ice-homepage-business-contact-policy/HOMEPAGE_BUSINESS_READY_CANDIDATE.json

The selected candidate is media-rich and matches the imported draft shape.

```json
{
  "label": "Selected business-ready candidate",
  "sourcePath": "content-review/ice-homepage-business-contact-policy/HOMEPAGE_BUSINESS_READY_CANDIDATE.json",
  "exists": true,
  "pageId": "ice-rink-rentals-home-phase8c14-normalized-candidate",
  "pageSlug": "home",
  "route": "/",
  "isPublished": false,
  "includeInSitemap": false,
  "workflowStatus": null,
  "reviewStatus": null,
  "blockCount": 10,
  "blockTypes": [
    "Hero",
    "TrustBar",
    "CardGrid",
    "customHtml",
    "HowItWorks",
    "customHtml",
    "customHtml",
    "FAQ",
    "formBlock",
    "PrimaryCTA"
  ],
  "heroHeadline": "Portable ice skating rink rentals for unforgettable events",
  "mediaUrlCount": 5,
  "mediaUrls": [
    "/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png",
    "/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png",
    "/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png",
    "/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png",
    "/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png"
  ],
  "publicUrlCount": 6,
  "mediaAssetIdCount": 0,
  "assetIdCount": 0,
  "imgTagCount": 0,
  "includesWinterFestAsset": true,
  "includesCorporateAsset": true,
  "includesHolidayAsset": true,
  "includesSetupAsset": true,
  "includesDefaultQuoteRequest": true,
  "includesHomepageQuoteForm": true
}
```

## MediaAsset-Bound Candidate

```json
{
  "label": "MediaAsset-bound candidate",
  "sourcePath": "content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json",
  "exists": true,
  "pageId": "ice-rink-rentals-home-phase8c14-normalized-candidate",
  "pageSlug": "home",
  "route": "/",
  "isPublished": false,
  "includeInSitemap": false,
  "workflowStatus": null,
  "reviewStatus": null,
  "blockCount": 10,
  "blockTypes": [
    "Hero",
    "TrustBar",
    "CardGrid",
    "customHtml",
    "HowItWorks",
    "customHtml",
    "customHtml",
    "FAQ",
    "formBlock",
    "PrimaryCTA"
  ],
  "heroHeadline": "Portable ice skating rink rentals for unforgettable events",
  "mediaUrlCount": 5,
  "mediaUrls": [
    "/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png",
    "/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png",
    "/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png",
    "/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png",
    "/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png"
  ],
  "publicUrlCount": 6,
  "mediaAssetIdCount": 0,
  "assetIdCount": 0,
  "imgTagCount": 0,
  "includesWinterFestAsset": true,
  "includesCorporateAsset": true,
  "includesHolidayAsset": true,
  "includesSetupAsset": true,
  "includesDefaultQuoteRequest": true,
  "includesHomepageQuoteForm": true
}
```

## Earlier Normalized Candidate

```json
{
  "label": "Phase 8C.14 normalized candidate",
  "sourcePath": "content-review/ice-homepage-phase8c14-validated/proposed-homepage.normalized-candidate.json",
  "exists": true,
  "pageId": "ice-rink-rentals-home-phase8c14-normalized-candidate",
  "pageSlug": "home",
  "route": "/",
  "isPublished": false,
  "includeInSitemap": false,
  "workflowStatus": null,
  "reviewStatus": null,
  "blockCount": 10,
  "blockTypes": [
    "Hero",
    "TrustBar",
    "CardGrid",
    "customHtml",
    "HowItWorks",
    "customHtml",
    "customHtml",
    "FAQ",
    "formBlock",
    "PrimaryCTA"
  ],
  "heroHeadline": "Portable ice skating rink rentals for unforgettable events",
  "mediaUrlCount": 0,
  "mediaUrls": [],
  "publicUrlCount": 1,
  "mediaAssetIdCount": 0,
  "assetIdCount": 0,
  "imgTagCount": 0,
  "includesWinterFestAsset": true,
  "includesCorporateAsset": true,
  "includesHolidayAsset": true,
  "includesSetupAsset": true,
  "includesDefaultQuoteRequest": true,
  "includesHomepageQuoteForm": true
}
```

## Decision

- Wrong candidate imported: no.
- The selected candidate contains the expected rich block structure, quote form mapping, and homepage media references.
- The current imported draft readback root page matches the selected rich homepage shape.
- The contact correction import intentionally skipped homepage writes and did not overwrite the homepage draft.
