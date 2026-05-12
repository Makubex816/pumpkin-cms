# Ice Rink Web Scaffold Report

## Executive summary

Created `apps/ice-rink-web` as a reusable multi-site Next.js frontend based on `apps/sample-app`. The app resolves the current site server-side from the request host, keeps Pumpkin API keys server-only, fetches pages/themes/sitemap entries by resolved `tenantId`, and falls back to local site-aware home/theme data for the ice rink MVP.

The scaffold currently supports:

- `ice-rink-rentals` at `iceskatingrinkrentals.com`, `localhost:3002`, and `127.0.0.1:3002`.
- `second-product-rentals` at `second-domain-placeholder.com` and `second.localhost:3002`.

No shared package source files were modified.

## Files added

- `apps/ice-rink-web/.env.example`
- `apps/ice-rink-web/.eslintrc.json`
- `apps/ice-rink-web/.gitignore`
- `apps/ice-rink-web/README.md`
- `apps/ice-rink-web/package.json`
- `apps/ice-rink-web/next.config.js`
- `apps/ice-rink-web/tailwind.config.js`
- `apps/ice-rink-web/postcss.config.js`
- `apps/ice-rink-web/tsconfig.json`
- `apps/ice-rink-web/src/app/layout.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/sitemap.xml/route.ts`
- `apps/ice-rink-web/src/app/not-found.tsx`
- `apps/ice-rink-web/src/app/globals.css`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/components/SiteHeader.tsx`
- `apps/ice-rink-web/src/components/SiteFooter.tsx`
- `apps/ice-rink-web/src/components/StructuredData.tsx`
- `apps/ice-rink-web/src/config/sites.ts`
- `apps/ice-rink-web/src/lib/resolve-site.ts`
- `apps/ice-rink-web/src/lib/pumpkin-api.ts`
- `apps/ice-rink-web/src/lib/token-replace.ts`
- `apps/ice-rink-web/src/lib/metadata.ts`
- `apps/ice-rink-web/src/data/fallback-theme.ts`
- `apps/ice-rink-web/src/data/fallback-home.ts`
- `apps/ice-rink-web/src/data/index.ts`
- `apps/ice-rink-web/src/types/pumpkin-block-views.d.ts`

## Implementation notes

- Site resolution uses `next/headers` and checks `x-forwarded-host` before `host`.
- Host matching normalizes `www.` and falls back to the ice rink site when no match is found.
- Tenant IDs, API keys, and canonical URLs are resolved from per-site environment variables.
- Pumpkin API keys remain server-only and are sent as `Authorization: Bearer {apiKey}` from server-side fetches.
- Homepage fetches slug `home` and uses `getFallbackHome(site)` if the CMS page is unavailable.
- Dynamic routes join catch-all segments with `/` and call `notFound()` when the CMS page is missing.
- Metadata uses CMS SEO fields with site-specific canonical URL fallbacks.
- Sitemap XML uses the resolved site's canonical URL and tenant-scoped sitemap entries.
- Block rendering follows the sample app pattern through `BlockViewRenderer`; no custom ice-rink block types were added.
- `next.config.js` aliases `pumpkin-block-views` to the package source because the linked package does not currently provide a built `dist/` directory.

## Environment

`apps/ice-rink-web/.env.example` includes:

```env
PUMPKIN_API_URL=http://localhost:5064

ICE_RINK_RENTALS_TENANT_ID=ice-rink-rentals
ICE_RINK_RENTALS_API_KEY=your-ice-rink-tenant-api-key
ICE_RINK_RENTALS_CANONICAL_URL=https://iceskatingrinkrentals.com

SECOND_PRODUCT_TENANT_ID=second-product-rentals
SECOND_PRODUCT_API_KEY=your-second-product-tenant-api-key
SECOND_PRODUCT_CANONICAL_URL=https://second-domain-placeholder.com
```

## Checks run

- `npm install` in `apps/ice-rink-web`: passed.
- `npm run lint` in `apps/ice-rink-web`: passed.
- `npm run type-check` in `apps/ice-rink-web`: passed.
- `npm run build` in `apps/ice-rink-web`: passed.

## Warnings and failures encountered

- `npm install` completed but reported dependency deprecation warnings and `9 vulnerabilities` from the installed dependency tree.
- The first lint attempt prompted for ESLint setup because the copied sample app did not include an ESLint config. I added an app-local `.eslintrc.json`; lint now passes.
- A parallel `npm run type-check` run once failed while `next build` was generating `.next/types`. Running `npm run type-check` by itself passes.
- Attempting to build `packages/pumpkin-block-views` directly failed because that shared package has existing TypeScript errors in `src/views/FooterView.tsx` for implicit `any` parameters. I did not modify the shared package; the ice rink app works around the missing package build output with an app-local webpack alias and type declaration.

## Next recommended step

Seed Pumpkin CMS with the four MVP pages for the `ice-rink-rentals` tenant, then run `apps/ice-rink-web` on port `3002` against the local API to verify live CMS content, theme rendering, metadata, sitemap output, and form behavior.
