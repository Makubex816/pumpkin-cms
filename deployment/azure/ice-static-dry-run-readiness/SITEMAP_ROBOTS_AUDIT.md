# Sitemap Robots Audit

## Fresh Dry Run

Fresh sitemap and robots output was produced by the successful local static export.

Route-shape proof passed, but production/indexing readiness remains blocked by CMS robots metadata.

## Current CMS Metadata

Approved-page robots metadata in the fresh snapshot:

| Slug | Source field | Active value | Rendered output |
| --- | --- | --- | --- |
| `home` | `page.seo.robots` | `noindex, nofollow` | `apps/ice-rink-web/out/index.html` renders `<meta name="robots" content="noindex, nofollow"/>` |
| `contact` | `page.seo.robots` | `index,follow` | `apps/ice-rink-web/out/contact/index.html` renders `<meta name="robots" content="index,follow"/>` |
| `service-areas` | `page.seo.robots` | `noindex, nofollow` | `apps/ice-rink-web/out/service-areas/index.html` renders `<meta name="robots" content="noindex, nofollow"/>` |

Noindex is coming from CMS page metadata. The code path is:

1. `apps/ice-rink-web/src/app/page.tsx` loads `home` and calls `buildMetadata(...)`.
2. `apps/ice-rink-web/src/app/[...slug]/page.tsx` loads slug pages and calls `buildMetadata(...)`.
3. `apps/ice-rink-web/src/lib/metadata.ts` emits `robots: seo.robots || 'index, follow'`.

This is not caused by theme defaults, static export environment, or validator logic. No CMS metadata write was performed.

Contact note: the active contact page is indexable, but `page.revision.latestSnapshot.page.seo.robots` still contains stale `noindex,nofollow` metadata. The rendered contact route uses the active page `seo.robots` value.

Recommended CMS metadata change: when production approval is granted, set `home` and `service-areas` robots metadata to `index,follow` or otherwise clear their noindex controls.

No safe local tooling repair was applied because overriding active CMS `seo.robots` during static generation would hide a real production indexing blocker.

## Strict Validator Result

Strict production/staging validators still reject the generated output for noindex:

- `index.html`
- `service-areas/index.html`

They also reject media and form endpoint blockers.

## Readiness

Sitemap/robots route output proof: yes.

Production/indexing readiness: no.
