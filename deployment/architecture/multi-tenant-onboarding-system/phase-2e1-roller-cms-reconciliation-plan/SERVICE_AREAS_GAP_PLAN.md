# Service Areas Gap Plan

## Gap

The local package expects:

- route `/service-areas/`
- slug `service-areas`

Phase 2C-6B documented CMS HTTP 404 for `service-areas`.

## Recommended Handling

1. Keep `service-areas` missing during Phase 2E-1.
2. In a future approved read-only refresh, verify no hidden, draft, archived, or legacy `service-areas` route exists.
3. Compare desired `service-areas` content from the local package against owner-approved copy.
4. If still missing, request explicit CMS write approval to create/import only `service-areas`.
5. After creation, run readback verification for route, slug, workflow, robots, sitemap inclusion, canonical URL, and page content.
6. Do not publish live pages or request indexing as part of the page creation approval.

## Abort Conditions

Abort before any future create if:

- a hidden/legacy `service-areas` record is found;
- a different page already claims `/service-areas/`;
- owner-approved content is missing;
- CMS write approval is ambiguous;
- requested action includes deployment, Search Console, indexing, DNS, Cloudflare, Azure, email, or live-page publication.
