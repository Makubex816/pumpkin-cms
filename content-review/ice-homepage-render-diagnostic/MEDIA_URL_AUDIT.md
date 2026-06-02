# Media URL Audit

## Current Draft Media URLs

```json
{
  "note": "The imported rich draft currently references three unique page media URLs; the five MediaAsset records exist in the prior MediaAsset binding report.",
  "currentDraftUniqueMediaUrls": [
    "/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png",
    "/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png",
    "/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png"
  ],
  "apiHostResults": [
    {
      "url": "http://localhost:5064/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png",
      "status": 200,
      "contentType": "image/png",
      "result": "available from API local media host"
    },
    {
      "url": "http://localhost:5064/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png",
      "status": 200,
      "contentType": "image/png",
      "result": "available from API local media host"
    },
    {
      "url": "http://localhost:5064/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png",
      "status": 200,
      "contentType": "image/png",
      "result": "available from API local media host"
    }
  ],
  "frontendHostResults": [
    {
      "url": "http://localhost:3002/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png",
      "status": 404,
      "contentType": "text/html",
      "result": "not served by Next frontend host"
    },
    {
      "url": "http://localhost:3002/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png",
      "status": 404,
      "contentType": "text/html",
      "result": "not served by Next frontend host"
    },
    {
      "url": "http://localhost:3002/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png",
      "status": 404,
      "contentType": "text/html",
      "result": "not served by Next frontend host"
    }
  ],
  "nextConfigFinding": "apps/ice-rink-web/next.config.js does not define a /media rewrite or proxy to the API media host."
}
```

## MediaAsset Context

The previous MediaAsset binding package documents five Ice homepage MediaAsset records for the official media set:

- IceSkatingRinkRentalsLogo.png
- WinterFestIceRinkRentals.png
- CorporateIceRinkRentalEvent.png
- HolidayIceRink.png
- IceRinkRentalsSetup.png

This diagnostic did not create, update, or delete MediaAsset records.

## Decision

The media files appear available from the Pumpkin API local media host, but relative /media URLs do not resolve from the Next frontend host. Once the rich draft is rendered by the frontend, a local media URL strategy is still required for visible images.
