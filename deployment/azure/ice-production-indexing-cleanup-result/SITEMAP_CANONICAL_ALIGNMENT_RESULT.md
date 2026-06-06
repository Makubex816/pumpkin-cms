# Sitemap Canonical Alignment Result

Generated: 2026-06-06

## Policy

Canonical host remains the apex production host:

```text
https://iceskatingrinkrentals.com
```

The existing canonical tags for non-root routes use trailing slashes, so the safest consistency fix was to align sitemap generation with that already-live canonical behavior.

## Code Updated

Updated URL generation in:

- `apps/ice-rink-web/src/lib/metadata.ts`
- `apps/ice-rink-web/scripts/static-publish.mjs`

Root and non-root URLs now emit:

```text
https://iceskatingrinkrentals.com/
https://iceskatingrinkrentals.com/contact/
https://iceskatingrinkrentals.com/service-areas/
```

## Result

Generated `sitemap.xml` now lists:

```xml
<loc>https://iceskatingrinkrentals.com/contact/</loc>
<loc>https://iceskatingrinkrentals.com/</loc>
<loc>https://iceskatingrinkrentals.com/service-areas/</loc>
```

Live production after redeploy also lists the same trailing-slash URLs from apex, `www`, and the Azure default hostname.

No route paths, obsolete routes, staging URLs, CMS records, DNS, or Cloudflare settings were changed.
