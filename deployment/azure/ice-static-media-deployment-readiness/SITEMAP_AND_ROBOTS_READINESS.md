# Sitemap And Robots Readiness

## Current Live CMS Signals

| Page | includeInSitemap | robots |
| --- | --- | --- |
| home | true | `noindex, nofollow` |
| contact | true | `index,follow` |
| service-areas | true | `noindex, nofollow` |

The public local routes return 200 and are visually approved. However, production indexing is not ready because the approved route set still contains noindex signals for home and service areas.

## Static Tooling Behavior

Static artifact generation writes:

- `sitemap.xml`
- `robots.txt`
- `redirects.json`
- `static-publish-manifest.json`

Sitemap generation includes pages where `isPublished` and `includeInSitemap` are true. Robots generation currently points to the production sitemap URL for the site.

## Current Blockers

- Sitemap inclusion and noindex signals are inconsistent for home and service areas.
- Existing static route validators still expect older route folders.
- Existing generated sitemap/robots artifacts are stale and must not be treated as current.
- Production indexing policy has not been approved.

## Readiness Result

Ready for production indexing: no.

Sitemap/robots should be rechecked after fresh CMS snapshot/export, media URL migration, and explicit indexing approval.

