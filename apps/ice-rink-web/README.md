# Ice Rink Web

Reusable multi-site rental frontend powered by Pumpkin CMS.

## Sites

This app resolves the current site from the request host on the server:

- `iceskatingrinkrentals.com`, `localhost:3002`, `127.0.0.1:3002`
- `rollerrinkrentals.com`, `roller.localhost:3002`

Unknown hosts fall back to the Ice Skating Rink Rentals site.

## Local Setup

```bash
cd apps/ice-rink-web
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3002`.

## Environment Variables

`PUMPKIN_API_URL` points to the Pumpkin API. Tenant IDs, API keys, and canonical URLs are configured per site:

```env
PUMPKIN_API_URL=http://localhost:5064

ICE_RINK_RENTALS_TENANT_ID=ice-rink-rentals
ICE_RINK_RENTALS_API_KEY=your-api-key
ICE_RINK_RENTALS_CANONICAL_URL=https://iceskatingrinkrentals.com

ROLLER_RINK_RENTALS_TENANT_ID=roller-rink-rentals
ROLLER_RINK_RENTALS_API_KEY=your-api-key
ROLLER_RINK_RENTALS_CANONICAL_URL=https://rollerrinkrentals.com
```

API keys are server-only and are not exposed with `NEXT_PUBLIC_`.

## Architecture

- `src/config/sites.ts` defines site mappings, host matching, env names, brand tokens, and fallback behavior.
- `src/lib/resolve-site.ts` reads `next/headers` server-side and resolves the current site from `Host` or `X-Forwarded-Host`.
- `src/lib/pumpkin-api.ts` fetches pages, active themes, and sitemap entries by resolved `tenantId`.
- `src/lib/token-replace.ts` replaces `{{brand}}`, `{{service}}`, `{{product}}`, `{{products}}`, `{{canonicalUrl}}`, and `{{domain}}`.
- `src/lib/metadata.ts` maps CMS SEO fields into site-specific Next.js metadata and canonical URLs.
- `src/data/fallback-home.ts` and `src/data/fallback-theme.ts` keep the app usable before CMS content is seeded.

## Routes

- `/` fetches Pumpkin slug `home` and falls back to local homepage content.
- `/[...slug]` fetches the joined path as a Pumpkin slug and returns `notFound()` when missing.
- `/sitemap.xml` fetches published sitemap entries for the resolved tenant and uses the resolved canonical URL.

No custom ice-rink block types are registered yet; the app uses the existing `pumpkin-block-views` renderer.
