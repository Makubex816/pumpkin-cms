# Draft Preview Route

## Added Route

Actual route:

`/draft-preview/ice-rink-rentals/service-areas`

Preview alias:

`/__preview/ice-rink-rentals/service-areas`

## Files Updated

- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/service-areas/page.tsx`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/DraftPreviewClient.tsx`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/DraftPreviewClient.tsx` moved to the shared preview client path
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/previewConfig.ts`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/page.tsx`
- `apps/ice-rink-web/next.config.js`

## Behavior

The service-areas preview page:

- is noindexed through route metadata
- is disabled when static render mode is active
- uses the shared draft preview client
- requires manual admin JWT entry in the browser
- fetches `/api/admin/pages/{tenantId}/service-areas`
- fetches the active admin Theme when available
- renders through the same `PageRenderer` used by public pages
- does not create or replace the public `/service-areas` route

The alias rewrite was added alongside the existing homepage preview rewrite.
