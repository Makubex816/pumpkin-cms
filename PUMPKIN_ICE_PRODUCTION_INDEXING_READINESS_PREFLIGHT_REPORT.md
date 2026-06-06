# Pumpkin Ice Production Indexing Readiness Preflight Report

Generated: 2026-06-06

## Result

Ice production indexing/search readiness preflight is complete.

| Area | Result |
| --- | --- |
| production custom domain cutover | yes |
| production smoke test passed | yes |
| approved routes live | yes |
| sitemap/robots live | yes |
| noindex absent | yes |
| canonical host | `https://iceskatingrinkrentals.com` |
| obsolete/preview checked routes | 404 |
| media/form non-email checks | pass |
| indexing preflight completed | yes |
| Search Console submission readiness | no-go pending risk acceptance or cleanup |
| Roller | paused |

## Route Checks

The approved production routes returned 200 over HTTPS on both apex and `www`:

- `/`
- `/contact`
- `/service-areas`

The same apex routes and support files also returned 200 with a Googlebot-style user agent.

## Canonical and Root/WWW

`www` serves equivalent 200 pages and does not redirect to apex. All checked pages declare apex canonical URLs. This matches the current canonical-only cutover behavior.

## Sitemap and Robots

`robots.txt` permits indexing and references:

```text
https://iceskatingrinkrentals.com/sitemap.xml
```

The sitemap returns 200 and lists only approved production apex URLs:

- `https://iceskatingrinkrentals.com/contact`
- `https://iceskatingrinkrentals.com`
- `https://iceskatingrinkrentals.com/service-areas`

Pre-submission note: sitemap URLs omit trailing slashes while canonical tags for `/contact` and `/service-areas` include trailing slashes.

## Indexing Meta

Page-level indexing signals pass:

- robots meta is `index,follow`
- no `noindex`
- titles and descriptions are present
- canonicals use the production apex host
- `latestSnapshot`, `CMS LIVE`, localhost, local media paths, Roller strings, and high-confidence secret-like strings were not found
- Open Graph/Twitter image URLs are omitted safely
- rendered/body media uses `media.iceskatingrinkrentals.com`

Indexing risk: production HTML still contains hidden serialized CMS review/workflow payload text with `draft` and `needs_review`. The `/contact` page also contains hidden text saying `Static generation and production indexing are not authorized`.

## Obsolete and Preview Routes

The checked obsolete, preview, and arbitrary missing routes returned 404 on apex and `www`:

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/draft-preview`
- `/draft-preview/ice-rink-rentals`
- `/phase-5a-csv-import-54754949`
- `/api/preview`
- `/preview`
- arbitrary missing route

## Media and Form

Nine production media URLs were checked and passed. Safe form `OPTIONS` checks passed for apex and `www`.

No valid form payload was submitted. No email was sent.

## Search Console Next Steps

Future approval should decide whether to:

1. clean up hidden CMS review/indexing payload and sitemap/canonical slash alignment first
2. accept the documented risks and submit the sitemap
3. verify Search Console ownership if needed
4. submit `https://iceskatingrinkrentals.com/sitemap.xml`
5. optionally inspect/request indexing for `/`, `/contact/`, and `/service-areas/`
6. monitor indexing, selected canonical, sitemap processing, crawl errors, and 404s

No Search Console work was performed in this run.

## Boundary Confirmation

No Search Console submission, sitemap submission, URL Inspection request, indexing request, robots/sitemap change, CMS write, MediaAsset write, DNS change, Cloudflare change, Azure change, deployment, Function setting change, valid form submission, email, Microsoft 365 action, protected config read, generated static artifact staging, or Roller work occurred.

## Result Package

See `deployment/azure/ice-production-indexing-readiness-preflight/`.
