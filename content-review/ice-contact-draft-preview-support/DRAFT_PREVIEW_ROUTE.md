# Draft Preview Route

Actual route added:

- `http://localhost:3002/draft-preview/ice-rink-rentals/contact`

Alias/rewrite added:

- `http://localhost:3002/__preview/ice-rink-rentals/contact`

Implementation:

- Added `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/contact/page.tsx`.
- Updated `apps/ice-rink-web/next.config.js` preview rewrites.
- Reused `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/DraftPreviewClient.tsx`.

The route is a local draft preview shell. It does not replace the public `/contact` route and is guarded by the same preview enablement and noindex metadata used by the existing Ice preview routes.
