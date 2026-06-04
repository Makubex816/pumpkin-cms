# Sitemap Robots Audit

## Fresh Dry Run

Fresh sitemap and robots output was produced by the successful local static export.

Route-shape proof passed, and the noindex production/indexing blocker is cleared for the approved pages.

## Current CMS Metadata

Approved-page robots metadata in the fresh snapshot:

| Slug | Source field | Active value | Rendered output |
| --- | --- | --- | --- |
| `home` | `page.seo.robots` | `index,follow` | `apps/ice-rink-web/out/index.html` renders `<meta name="robots" content="index,follow"/>` |
| `contact` | `page.seo.robots` | `index,follow` | `apps/ice-rink-web/out/contact/index.html` renders `<meta name="robots" content="index,follow"/>` |
| `service-areas` | `page.seo.robots` | `index,follow` | `apps/ice-rink-web/out/service-areas/index.html` renders `<meta name="robots" content="index,follow"/>` |

Noindex is coming from CMS page metadata. The code path is:

1. `apps/ice-rink-web/src/app/page.tsx` loads `home` and calls `buildMetadata(...)`.
2. `apps/ice-rink-web/src/app/[...slug]/page.tsx` loads slug pages and calls `buildMetadata(...)`.
3. `apps/ice-rink-web/src/lib/metadata.ts` emits `robots: seo.robots || 'index, follow'`.

The prior noindex values on `home` and `service-areas` were caused by CMS page metadata and were repaired through the explicitly approved active CMS metadata update.

Contact note: the active contact page is indexable, but `page.revision.latestSnapshot.page.seo.robots` still contains stale `noindex,nofollow` metadata. The rendered contact route uses the active page `seo.robots` value.

No stale revision metadata was manually updated.

No local tooling override was applied.

## Strict Validator Result

Strict production/staging validators no longer reject the generated output for noindex. They still reject local body/media URL and form endpoint blockers.

## Readiness

Sitemap/robots route output proof: yes.

Production/indexing readiness for the noindex gate: yes.
