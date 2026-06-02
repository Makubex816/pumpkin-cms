# Draft Preview Route

## Route

```json
{
  "requestedUrl": "http://localhost:3002/__preview/ice-rink-rentals/home",
  "validationUrl": "http://localhost:3004/__preview/ice-rink-rentals/home",
  "actualAppRoute": "/draft-preview/ice-rink-rentals/home",
  "rewriteSource": "/__preview/ice-rink-rentals/home",
  "rewriteDestination": "/draft-preview/ice-rink-rentals/home",
  "reasonForRewrite": "Next app-router folders beginning with _ are private and not routable, so __preview is supported through a rewrite to a routable internal preview path."
}
```

## Implementation

- The routable app page lives at apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/page.tsx.
- The requested /__preview/ice-rink-rentals/home URL is mapped through next.config.js rewrites.
- The preview client lives at apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/DraftPreviewClient.tsx.
- The client fetches GET /api/admin/pages/ice-rink-rentals/home with a runtime Bearer JWT supplied by the reviewer.
- The same PageRenderer component used by public pages renders the draft page.
- Active theme is fetched from the admin theme endpoint when JWT auth succeeds; otherwise the Ice fallback theme is used.

## Probe Result

```json
{
  "status": 200,
  "bytes": 27084,
  "hasPreviewBanner": true,
  "hasJwtPrompt": true,
  "hasNoindex": true,
  "hasPublicUnchangedText": true
}
```

## Existing 3002 Note

The already-running 3002 process returned 404 before restart. This is expected until that process picks up the new route and next.config.js rewrite.
