# Preview Route Exclusion Check

## Existing Preview Routes

The app contains local draft preview routes for:

- `/draft-preview/ice-rink-rentals/home`
- `/draft-preview/ice-rink-rentals/contact`
- `/draft-preview/ice-rink-rentals/service-areas`

Dev rewrite aliases in `next.config.js` include:

- `/__preview/ice-rink-rentals/home`
- `/__preview/ice-rink-rentals/contact`
- `/__preview/ice-rink-rentals/service-areas`

## Safety Controls

Each preview page sets noindex metadata and calls shared preview config. The shared preview config disables draft preview in static render mode.

When `PUMPKIN_RENDER_MODE=static`, `isDraftPreviewEnabled()` returns false, and preview pages call `notFound()`.

## Remaining Validation

A later static export task must verify the generated package does not contain deployable preview pages or `__preview` content paths.

Expected checks after export:

- no `draft-preview` route files in deployable artifact
- no `__preview` route files in deployable artifact
- no admin JWT wording beyond harmless UI chunks if unavoidable
- no local admin preview behavior reachable from the staging host

## Result

Preview route exclusion appears designed correctly but has not been proven against a fresh current export package.

