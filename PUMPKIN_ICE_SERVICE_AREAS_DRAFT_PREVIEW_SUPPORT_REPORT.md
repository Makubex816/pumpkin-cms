# Pumpkin Ice Service Areas Draft Preview Support Report

Created: 2026-06-03

## Summary

Added a local draft preview route for the Ice Skating Rink Rentals `/service-areas` draft. The route reuses the homepage draft preview auth lifecycle and renderer path, adds a `__preview` alias, and leaves public `/service-areas` unchanged.

Preview URL:

http://localhost:3002/__preview/ice-rink-rentals/service-areas

## Git Status At Start

Start state had no tracked modifications. The only untracked files were the existing approved service-areas input package and extracted raw input files under:

- `content-review/ice-service-areas-input/ice-service-areas-phase11b-production-polish.zip`
- `content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/`

No protected config files were read.

## Files Changed

- `apps/ice-rink-web/next.config.js`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/DraftPreviewClient.tsx`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/DraftPreviewClient.tsx` moved to the shared preview client path
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/previewConfig.ts`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/page.tsx`
- `apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/service-areas/page.tsx`
- `content-review/ice-service-areas-draft-preview-support/README.md`
- `content-review/ice-service-areas-draft-preview-support/DRAFT_PREVIEW_ROUTE.md`
- `content-review/ice-service-areas-draft-preview-support/SERVICE_AREAS_PREVIEW_BEHAVIOR.md`
- `content-review/ice-service-areas-draft-preview-support/MEDIA_PROXY_CHECK.md`
- `content-review/ice-service-areas-draft-preview-support/PREVIEW_SECURITY_NOTES.md`
- `content-review/ice-service-areas-draft-preview-support/FRONTEND_REVIEW_CHECKLIST.md`
- `content-review/ice-service-areas-draft-preview-support/VALIDATION_RESULTS.md`
- `content-review/ice-service-areas-draft-preview-support/manifest.json`
- `PUMPKIN_ICE_SERVICE_AREAS_DRAFT_PREVIEW_SUPPORT_REPORT.md`

## Preview Route Added

Actual route:

`http://localhost:3002/draft-preview/ice-rink-rentals/service-areas`

Alias route:

`http://localhost:3002/__preview/ice-rink-rentals/service-areas`

The service-areas preview page uses the shared draft preview client, requires manual admin JWT entry, fetches the service-areas draft from the local Pumpkin admin API after token entry, and renders through `PageRenderer`.

## Alias Rewrite Result

`http://localhost:3002/__preview/ice-rink-rentals/service-areas`

Probe result: `200`

## Public Route Behavior

`http://localhost:3002/service-areas`

Probe result: `404`

This confirms public `/service-areas` remains unchanged and unpublished.

## Draft Preview Behavior

`http://localhost:3002/draft-preview/ice-rink-rentals/service-areas`

Probe result: `200`

The route serves the local draft preview shell with the existing admin JWT entry pattern. No terminal-side token submission was performed and no secrets were printed.

## Media Proxy Result

Checked:

`http://localhost:3002/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png`

HEAD result: `200`

The existing media proxy rewrite remains in place for `/media/ice-rink-rentals/:path*`.

## Validation Results

- `npm run type-check` in `apps/ice-rink-web`: passed
- `node --check next.config.js` in `apps/ice-rink-web`: passed
- route/file syntax checks: covered by TypeScript and JS syntax validation
- preview alias probe: `200`
- actual preview route probe: `200`
- public `/service-areas` probe: `404`
- media proxy HEAD probe: `200`
- `git diff --check`: passed with CRLF working-copy warnings only
- trailing whitespace scan: passed
- protected/generated/raw task path check: passed
- targeted secret scan: passed

## Safety Results

- CMS writes: none
- CMS imports: none
- `/` updates: none
- `/contact` updates: none
- `/service-areas` publish/approval: none
- Theme updates: none
- MediaAsset updates: none
- static generation: none
- deployment: none
- DNS/email/provider/Azure/Cloudflare/Bluehost changes: none
- Roller action: none
- protected config reads: none

## Next Recommended Action

Open the preview URL, enter the local admin JWT in the browser, and visually inspect the service-areas draft before any live CMS promotion.
