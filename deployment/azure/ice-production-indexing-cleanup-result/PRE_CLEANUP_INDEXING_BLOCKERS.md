# Pre-Cleanup Indexing Blockers

Generated: 2026-06-06

## Live Baseline Before Cleanup

The live production pre-cleanup baseline was no-go for Search Console submission because the site was crawlable but still exposed hidden CMS review/indexing payload strings and had sitemap/canonical URL shape drift.

| Check | Pre-cleanup result |
| --- | --- |
| apex approved routes `/`, `/contact`, `/service-areas` | 200 |
| `www` approved routes `/`, `/contact`, `/service-areas` | 200 |
| obsolete/preview routes checked | 404 |
| robots.txt | 200, permitted indexing, referenced production sitemap |
| `/contact` canonical | `https://iceskatingrinkrentals.com/contact/` |
| `/service-areas` canonical | `https://iceskatingrinkrentals.com/service-areas/` |
| sitemap locs | omitted trailing slashes |
| hidden serialized review payload | present |

## Exact Blocking Strings

The live `/contact` HTML contained hidden serialized payload strings including:

- `Static generation and production indexing are not authorized`
- `needs_review`
- `schemaWarnings`
- `pageQuality`

The live `/service-areas` HTML contained hidden serialized payload strings including:

- `needs_review`
- `schemaWarnings`
- `pageQuality`

## Snapshot Evidence

The fresh CMS snapshot still contains admin/review metadata by design:

| File | Evidence |
| --- | --- |
| `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/pages/contact.json` | `usageStatus`/`status` values such as `needs_review`; `pageQuality.status` at line 1369; contact indexing warning at line 1373; `schemaWarnings` at lines 1442-1443 |
| `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/pages/service-areas.json` | `usageStatus` values such as `needs_review`; `pageQuality.status` at lines 1079-1080; public service areas warning at line 1084; `schemaWarnings` at line 1153 |
| `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/pages/home.json` | `usageStatus` values such as `needs_review`; `pageQuality.status` at lines 1969-1970; `schemaWarnings` at line 2041 |

The cleanup intentionally did not write CMS records. The snapshot can continue to preserve admin/review metadata while deployable public output omits it.
