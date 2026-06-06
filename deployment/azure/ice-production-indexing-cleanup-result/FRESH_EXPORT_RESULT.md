# Fresh Export Result

Generated: 2026-06-06

## Command

Run from `apps/ice-rink-web` with the approved public static form endpoint environment:

```powershell
npm run export:static:ice:cms
```

## Result

| Check | Result |
| --- | --- |
| command exit code | 0 |
| CMS snapshot | success |
| page count | 3 |
| published count | 3 |
| unpublished count | 0 |
| theme snapshot | true |
| static publish output | success |
| deployable file count | 42 |
| sitemap count | 3 |
| redirect count | 0 |

## Snapshot Slugs

The fresh CMS snapshot slugs were exactly:

- `contact`
- `home`
- `service-areas`

## Deployable Routes

The generated/copied deployable routes were exactly:

- `/`
- `/contact`
- `/service-areas`

Preview/obsolete deployable paths were absent:

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/draft-preview`
- `/__preview`

## Known Snapshot Warnings

The export retained known CMS metadata warnings such as `staticPublishing.needsRebuild`, missing fulfillment status, and service-area disclosure metadata. These warnings are not serialized into deployable public HTML after the cleanup.

No CMS writes or MediaAsset writes occurred.
