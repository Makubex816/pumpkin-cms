# SEO And Sitemap Reconciliation

## Package Policy

The local package expects:

- default robots: `noindex,nofollow`;
- sitemap policy: `disabled-until-final-gate`;
- Search Console/indexing: not approved;
- live pages: not approved.

## Existing CMS Evidence

Phase 2C-6B documented:

- public sitemap returned HTTP 200 with 3 entries;
- `home`, `contact`, and `roller-rink-rentals` are sitemap-included;
- those pages have `noindex, nofollow`.

## Reconciliation Recommendation

Preserve current sitemap and robots state until a later owner-approved SEO gate.

Do not remove pages from sitemap, change robots, request indexing, or use Search Console in reconciliation planning.

## Future Gate

A future SEO/sitemap write approval should decide:

- whether `home` and `contact` stay sitemap-included while `noindex`;
- whether `roller-rink-rentals` stays sitemap-included;
- whether newly created `service-areas` should be excluded until final gate;
- whether robots should remain `noindex,nofollow` through staging/review.
