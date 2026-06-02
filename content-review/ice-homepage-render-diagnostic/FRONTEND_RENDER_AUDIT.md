# Frontend Render Audit

## Service Health

```json
{
  "api": {
    "url": "http://localhost:5064",
    "reachable": true,
    "status": 200
  },
  "admin": {
    "url": "http://localhost:3000",
    "reachable": true,
    "status": 200
  },
  "iceFrontend": {
    "url": "http://localhost:3002",
    "reachable": true,
    "status": 200,
    "bytes": 34129
  },
  "iceContact": {
    "url": "http://localhost:3002/contact",
    "reachable": true,
    "status": 200,
    "bytes": 48799
  }
}
```

## Homepage Probe

```json
{
  "url": "http://localhost:3002/",
  "status": 200,
  "bytes": 34129,
  "title": "Portable Ice Rink Rentals for Events",
  "description": "Portable ice rink rentals for events, schools, towns, corporate parties, and holiday activations.",
  "probes": {
    "redesignedTitle": false,
    "oldSimpleTitle": true,
    "winterFestAsset": false,
    "corporateAsset": false,
    "holidayAsset": false,
    "setupAsset": false,
    "mediaPath": false,
    "imgTags": false,
    "requestPlanningGuidance": false,
    "builtAroundYourEvent": false,
    "homepageQuoteForm": false,
    "defaultQuoteRequest": false
  },
  "imgTagCount": 0,
  "mediaPathCount": 0
}
```

## Finding

The HTML returned by http://localhost:3002/ contains the old/simple homepage title and does not contain the redesigned homepage markers, media asset filenames, /media paths, homepage quote form key, or default quote request mapping.

This means the local frontend is not rendering the imported rich homepage draft on the public root route.

## Contact Page Note

The contact route was reachable during service probing. This diagnostic did not inspect or modify contact CMS records because the user requested homepage render diagnosis only.
