# Ice Homepage Import Preflight

This folder contains the safe local import preflight package for the IceSkatingRinkRentals.com homepage candidate.

The preflight is intentionally non-mutating. It does not import the homepage into CMS, update Page or Theme records, create MediaAsset records, regenerate static output, deploy, send email, or read protected config.

## Source Candidate

- `content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json`
- tenantId: `ice-rink-rentals`
- siteKey: `ice-rink-rentals`
- route: `/`
- canonical: `https://iceskatingrinkrentals.com/`

## Command

```powershell
node tools/import-preflight/import-preflight.mjs `
  --input content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json `
  --tenant-id ice-rink-rentals `
  --site-key ice-rink-rentals `
  --route / `
  --mode preflight-only `
  --output content-review/ice-homepage-import-preflight/homepage-import-preflight-result.json
```

## Result Summary

- Shape/import contract: valid
- .NET Page/block contract: passed
- Local draft import: conditional, with explicit unresolved-media and review approval required
- CMS import: blocked
- Static regeneration: blocked
- Production/indexing: blocked

RollerRinkRentals.com remains paused.

