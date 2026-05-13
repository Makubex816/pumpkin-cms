# Ice Rink Second Domain Variable Layer Plan

## Milestone Summary

The reusable rental-site frontend now has a second-domain proof layer started in configuration. The current `apps/ice-rink-web` app can resolve a site from the request host, map that host to tenant-specific environment variables, and use that resolved site for CMS page rendering, theme loading, sitemap generation, and contact form forwarding.

No second tenant has been seeded yet. This report defines the variable layer and the recommended next step for turning the current IceSkatingRinkRentals.com MVP into a repeatable multi-site rental website engine.

## Current Multi-site Support Status

`apps/ice-rink-web/src/config/sites.ts` already includes two site definitions:

- `ice-rink-rentals`
- `second-product-rentals`

The second-site placeholder is present and usable:

- `siteKey`: `second-product-rentals`
- `domain`: `second-domain-placeholder.com`
- `localHosts`: `second.localhost:3002`
- `tenantId` env var: `SECOND_PRODUCT_TENANT_ID`
- API key env var: `SECOND_PRODUCT_API_KEY`
- canonical URL env var: `SECOND_PRODUCT_CANONICAL_URL`
- brand name: `Second Product Rentals`
- primary service: `Second Product Rentals`
- product name: `second product`
- product plural: `second products`

Host resolution normalizes the request host, checks configured production domains and local hosts, then falls back to the default Ice Rink site if no match is found.

## What Already Works

- The app has a site registry that separates domain, tenant env var, API key env var, canonical URL env var, brand, service, and product wording.
- The Ice Rink tenant proves the CMS-backed flow through Cosmos, Pumpkin API, and the Next frontend.
- CMS-backed pages render using app-local polished block components.
- The contact form submits through an app-local server route, keeping the Pumpkin API key server-side.
- The local seed tool can recreate the Ice Rink tenant, theme, and pages.
- The sitemap path works for the active CMS-backed tenant.

## What Still Needs To Be Built

- A second tenant document in Cosmos for `second-product-rentals`.
- A second tenant API key hash generated and stored only through local environment/runtime setup.
- A second active theme document with second-domain branding, navigation, and visual settings.
- Second-site page seed JSON with original content, second-product language, unique SEO, and correct canonical URLs.
- A generalized seed tool that can select a site instead of assuming only `ice-rink-rentals`.
- Validation that second-site seed files do not accidentally retain Ice Rink copy, canonicals, structured data, contact details, or sitemap URLs.
- Optional form metadata refinement so form `source`, tags, and analytics fields clearly identify the resolved site.

## Recommended Second-site Tenant Setup

Create a separate tenant with:

- `tenantId`: `second-product-rentals`
- active status enabled
- API key hash supplied at runtime, never committed
- allowed origins for local and production testing
- a theme scoped to the second tenant
- page documents partitioned by `tenantId`

Recommended local env variables:

```powershell
$env:SECOND_PRODUCT_TENANT_ID = "second-product-rentals"
$env:SECOND_PRODUCT_API_KEY = "<plain local API key only>"
$env:SECOND_PRODUCT_CANONICAL_URL = "https://second-domain-placeholder.com"
```

Do not commit those values to `.env.local`, appsettings files, seed JSON, reports, or source code.

## Recommended Seed Structure

The current seed tool can stay in place for the Ice Rink MVP, but the next version should move toward this structure:

```text
tools/ice-rink-local-seed/
  seed-sites/
    ice-rink-rentals/
      tenant.template.json
      theme.json
      pages/
        home.json
        ice-rink-rentals.json
        events-holiday-activations.json
        contact.json
    second-product-rentals/
      tenant.template.json
      theme.json
      pages/
        home.json
        second-product-rentals.json
        events-activations.json
        contact.json
```

The scripts should later accept a site selector, for example:

```powershell
npm run validate -- --site second-product-rentals
npm run seed -- --site second-product-rentals
```

The tool should eventually be renamed from `tools/ice-rink-local-seed` to a broader name such as `tools/rental-local-seed` or `tools/multisite-local-seed`, because the next version will manage more than one tenant.

## Required Variable Differences

Each site must own these values independently:

- tenantId
- domain
- canonical URL
- brand name
- service name
- product wording
- theme
- page copy
- form tags/source
- sitemap URLs
- SEO titles and descriptions
- structured data
- contact email and phone

## Hostname Resolution

For local second-site testing, requests should use:

```text
http://second.localhost:3002
```

The frontend resolves that host to the `second-product-rentals` site definition, reads `SECOND_PRODUCT_TENANT_ID`, `SECOND_PRODUCT_API_KEY`, and `SECOND_PRODUCT_CANONICAL_URL` server-side, then uses those values for CMS page, theme, sitemap, and form submission calls.

If `second.localhost` does not resolve on a local Windows machine, add a local hosts entry or use a browser/runtime setup that maps `*.localhost` to `127.0.0.1`.

## Duplicate Content Risks

The second site must not be a direct wording swap of the Ice Rink tenant. Before production, replace placeholder language with differentiated product copy, unique metadata, correct structured data, distinct contact details, and a second-site theme. Canonicals, Open Graph URLs, sitemap URLs, and schema URLs must never point to the Ice Rink domain.

## Next Implementation Step

Generalize the seed tool into a site-selectable seed process, then add placeholder-safe second-site seed templates under `seed-sites/second-product-rentals`. After that, create the second tenant and API hash locally, run validation, seed the second tenant, and verify the app through `http://second.localhost:3002`.
