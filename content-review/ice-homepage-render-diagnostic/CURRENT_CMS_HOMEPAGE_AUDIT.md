# Current CMS Homepage Audit

## Start State

- Untracked input artifacts were present under content-review/ice-contact-email-correction-input/, including the uploaded ZIP and extracted files.
- No raw homepage media PNGs were staged by this diagnostic run.
- No CMS Page, Theme, MediaAsset, deployment, DNS, Azure, Cloudflare, Microsoft 365, or Bluehost writes were performed.

Recent commits observed at start:

- c60217f Add Ice contact local draft import report
- 2d8bb45 Add Ice homepage local draft import report
- 892dccb Add Ice homepage local draft import auth blocker report
- 9b7bcad Add Ice homepage business contact policy package
- dfe4f90 Bind Ice homepage MediaAsset records
- faf5986 Add Ice homepage MediaAsset binding blocker report
- 895f914 Add safe local homepage import preflight runner
- c6e6382 Add Ice homepage local CMS preview readiness report
- 2ecd323 Update Microsoft 365 operational verification docs
- 9f31719 Record confirmed Microsoft 365 mailbox verification
- 10393b7 Add Microsoft 365 operational email verification package

## Authentication Boundary

- Admin JWT status: ENV_JWT=MISSING and TEMP_JWT=MISSING.
- Safe JWT recheck after the user's "added the jwt" note still found JWT, ADMIN_JWT, PUMPKIN_ADMIN_JWT, PUMPKIN_CMS_ADMIN_JWT, TEMP_JWT, and the usual temp JWT files missing.
- No admin-only CMS read was attempted in this diagnostic run.
- Protected config was not read to obtain credentials.
- Current CMS homepage assessment therefore relies on prior authenticated import/readback artifacts plus public frontend/API probes.

## Current Local Draft Readback Artifact

Source: content-review/ice-homepage-local-draft-import/homepage-local-draft-imported-readback.json

Important distinction: the readback artifact contains both a page summary with an older revision snapshot and a root page object. The root page object is the imported draft page. The older pageSummary.revision.latestSnapshot.page is not the current imported page.

```json
{
  "label": "Current imported local draft readback root page",
  "sourcePath": "content-review/ice-homepage-local-draft-import/homepage-local-draft-imported-readback.json",
  "exists": true,
  "pageId": "ice-rink-rentals-home",
  "pageSlug": "home",
  "route": null,
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
  "mediaUrlCount": 3,
  "mediaUrls": [
    "/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png",
    "/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png",
    "/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png"
  ],
  "publicUrlCount": 4,
  "mediaAssetIdCount": 0,
  "assetIdCount": 0,
  "imgTagCount": 0,
  "includesWinterFestAsset": true,
  "includesCorporateAsset": true,
  "includesHolidayAsset": true,
  "includesSetupAsset": false,
  "includesDefaultQuoteRequest": true,
  "includesHomepageQuoteForm": true
}
```

## Public API Boundary

```json
{
  "pagesEndpoint": {
    "url": "http://localhost:5064/api/pages/ice-rink-rentals/home",
    "status": 400,
    "result": "API key is required"
  },
  "sitemapEndpoint": {
    "url": "http://localhost:5064/api/tenant/ice-rink-rentals/sitemap",
    "status": 400,
    "result": "API key is required"
  }
}
```

The public page endpoint requires the site API key and is documented in the API code as a published-page-by-slug endpoint. Without admin preview access, this diagnostic cannot use the frontend's public path to view unpublished draft content.
