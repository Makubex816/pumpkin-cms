# Official CMS Export Result

Generated: 2026-06-06

## Command

Run from `apps/ice-rink-web`:

```text
npm run export:static:ice:cms
```

Result: exit `0`.

## Export Status

| Step | Result |
| --- | --- |
| `snapshot:cms:ice` | passed |
| `validate:snapshot:ice` inside export | passed |
| `build:static:ice:cms` | passed with existing build warnings |
| `static-publish.mjs generate` | passed |
| official fresh CMS-backed export verified | yes |

## Snapshot Result

| Field | Result |
| --- | --- |
| content source | `cms-snapshot` |
| discovered published page count | `6` |
| approved page count | `3` |
| approved snapshot slugs | `contact`, `home`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |
| published count | `3` |
| unpublished count | `0` |
| theme snapshot | true |

The read-only snapshot tooling also scoped the local theme menu for route-shape proof and excluded non-approved routes from the local snapshot copy. No CMS or Theme write occurred.

## Generation Result

| Field | Result |
| --- | --- |
| generated site | `ice-rink-rentals` |
| domain | `iceskatingrinkrentals.com` |
| page count | `3` |
| sitemap count | `3` |
| redirect count | `0` |
| artifact directory | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals` |
| output snapshot | true |

Known warnings remain content/build hygiene warnings, not export blockers:

- `staticPublishing.needsRebuild is true` on the three snapshot pages
- missing fulfillment status on `contact` and `home`
- non-direct fulfillment public disclosure warning on `service-areas`
- excluded preview output paths were removed before artifact copy
- existing Next build warnings for hook dependencies, `<img>` usage, export custom routes, and an `fs` import trace

No CMS write, MediaAsset write, Function setting change, email send, Azure/Cloudflare change, static deployment, protected config read, or Roller work occurred.
