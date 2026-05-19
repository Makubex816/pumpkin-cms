# Cloudflare Cache And DNS Guidance

This is planning guidance only. Phase 5C does not change Cloudflare.

## DNS Concept

Use Cloudflare DNS records for each public site:

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`
- `rollerrinkrentals.com`
- `www.rollerrinkrentals.com`

The record target depends on the Azure hosting option:

- Azure Static Web Apps custom domain target
- Azure CDN / Front Door endpoint
- Azure Storage static website endpoint behind an HTTPS-capable front door

Use orange-cloud proxying when Cloudflare should provide CDN/WAF/cache behavior. Cache rules only apply to proxied records.

## Cache Rules

Recommended aggressive cache:

- `/_next/static/*`
- static font/image/css/js assets
- file extensions such as `.js`, `.css`, `.woff2`, `.png`, `.jpg`, `.webp`, `.svg`, `.ico`

Recommended conservative cache until purge exists:

- `/`
- HTML page routes
- `sitemap.xml`
- `robots.txt`

Once purge automation is reliable, HTML can be cached more aggressively with deploy-triggered purge.

## Bypass Rules

Bypass cache for dynamic or sensitive paths:

- `/api/*`
- `/admin/*`
- `/login*`
- `/dashboard/*`
- dynamic form endpoints
- `/contact*` if it is handled by a dynamic form service instead of pure static HTML

The current static public output does not include `/api/contact`, but future form/admin/API endpoints should be explicitly bypassed.

## Purge Strategy

Do not purge before upload finishes.

Recommended order:

1. validate static output
2. upload artifact to Azure
3. verify key routes return expected content
4. purge Cloudflare by hostname or route prefix
5. record purge result in a publishing log

Keep Cloudflare tokens in secret storage only.

## SSL/TLS

Recommended Cloudflare SSL mode depends on the Azure origin:

- use Full or Full Strict when the Azure origin has valid TLS
- avoid Flexible mode for production public sites
- verify canonical redirects before increasing HTML cache TTLs

For Azure Storage static website custom domains, plan carefully because the raw static website endpoint does not provide the same custom-domain HTTPS path as Static Web Apps. Cloudflare or Azure CDN/Front Door should terminate public HTTPS.
