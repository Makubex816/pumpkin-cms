# Ice Rink Web Fallback MVP Pages Report

## Files changed

- `apps/ice-rink-web/src/data/fallback-pages.ts`
- `apps/ice-rink-web/src/data/index.ts`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/sitemap.xml/route.ts`
- `apps/ice-rink-web/src/lib/pumpkin-api.ts`
- `apps/ice-rink-web/src/data/fallback-theme.ts`
- `ICE_RINK_WEB_FALLBACK_MVP_PAGES_REPORT.md`

No shared packages, API, or admin files were modified.

## Root cause of unstyled fallback pages

The fallback slug pages were receiving the same `PageRenderer`, fallback theme, and enhanced hero path as the homepage. The page markup included Tailwind class names, but the browser was receiving `404` responses for `/_next/static/...` CSS and JS assets.

That happened because a `next build`/check cycle had been run while an older `next dev` process was still serving the app. Both processes write/read `.next`, which left the dev server serving HTML that referenced static assets it could no longer serve. A clean dev-server restart restored CSS/JS delivery and the fallback pages rendered with the polished visual system.

After restart, the static CSS asset for each tested route returned `HTTP 200`.

## Fallback page slugs added

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/contact`

The existing fallback homepage at `/` still fetches slug `home` and continues to use `getFallbackHome(site)`.

## How fallback routing works

The dynamic route still tries Pumpkin CMS first:

1. Resolve the current site from the request host.
2. Fetch the page from Pumpkin CMS with the resolved `tenantId` and requested slug.
3. If the CMS page is unavailable, resolve a local fallback page from `getFallbackPage(site, slug)`.
4. Return `notFound()` only when neither CMS nor local fallback content exists.

Local fallback pages are regular Pumpkin `Page` objects using existing block types. Hero sections use the existing app-local enhanced hero renderer; no custom CMS block types were added.

## Metadata behavior

Fallback pages include full `Page.seo` data:

- site-aware meta titles
- site-aware meta descriptions
- keywords
- Open Graph fields
- Twitter Card fields
- JSON-LD structured data strings

The route passes fallback pages through the same `buildMetadata(page, site)` flow as CMS pages, so canonical URLs use the resolved site's canonical URL.

## Sitemap fallback behavior

`fetchSitemapData(site)` now returns `null` when the Pumpkin sitemap fetch cannot run or fails. The sitemap route falls back to local sitemap entries when that happens.

Fallback sitemap entries include:

- `home`
- `ice-rink-rentals`
- `events-holiday-activations`
- `contact`

URLs are emitted with `buildPageUrl(site, slug)`, so they use the resolved site canonical URL.

## Checks run

- `npm run lint`: passed.
- `npm run type-check`: passed.
- `npm run build`: passed.
- Clean `npm run dev` restart on port `3002`: passed.
- Local HTTP smoke test: passed for `/`, `/ice-rink-rentals`, `/events-holiday-activations`, `/contact`, and `/sitemap.xml`.
- Static CSS asset smoke test: `/_next/static/css/app/layout.css?...` returned `HTTP 200` for `/`, `/ice-rink-rentals`, `/events-holiday-activations`, and `/contact`.
- Headless Edge visual screenshots were generated temporarily for `/`, `/ice-rink-rentals`, `/events-holiday-activations`, and `/contact`; the pages showed styled header, hero, cards/forms, spacing, and typography. Temporary screenshots were removed after inspection.

## Errors or warnings

- Pumpkin API is not running locally, so API fetch failures/`ECONNREFUSED` logs are expected during fallback preview.
- An initial HTTP smoke test failed because the dev server on port `3002` was not running. I restarted `npm run dev`, then all smoke checks passed.
- If the pages look raw again after running `npm run build`, stop and restart `npm run dev`. Avoid running `next build` against the same app while `next dev` is serving from `.next`.

## Remaining issues

- The API is still not running locally, so fallback content is expected to render and API refusal logs are normal.
- The fallback MVP still uses app-local enhanced hero fields. Confirm later whether those fields should become first-class Pumpkin CMS fields.

## Next recommended step

Seed Pumpkin CMS with the same four MVP slugs and an active tenant theme, then compare CMS-rendered pages against the local fallback pages. Once the CMS data is confirmed, decide whether the enhanced hero fields should stay app-local or become first-class Pumpkin CMS fields.
