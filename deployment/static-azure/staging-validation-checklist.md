# Staging Validation Checklist

Use this after each Azure Static Web Apps staging deployment.

## Ice Staging URLs

Validate:

- `https://ice-dev.iceskatingrinkrentals.com/`
- `https://ice-dev.iceskatingrinkrentals.com/ice-rink-rentals`
- `https://ice-dev.iceskatingrinkrentals.com/events-holiday-activations`
- `https://ice-dev.iceskatingrinkrentals.com/contact`
- `https://ice-dev.iceskatingrinkrentals.com/sitemap.xml`
- `https://ice-dev.iceskatingrinkrentals.com/robots.txt`

## Roller Staging URLs

Validate:

- `https://roller-dev.rollerrinkrentals.com/`
- `https://roller-dev.rollerrinkrentals.com/roller-rink-rentals`
- `https://roller-dev.rollerrinkrentals.com/contact`
- `https://roller-dev.rollerrinkrentals.com/sitemap.xml`
- `https://roller-dev.rollerrinkrentals.com/robots.txt`

## Page Checks

For each staged page:

- page loads with a 200 response
- static assets load
- navigation links work
- footer links work
- page source contains no obvious secrets
- page source contains no `CMS LIVE` marker
- no live-domain cutover occurred
- no opposite-site branding appears

## Canonical And SEO Checks

Confirm canonical behavior is understood.

The current static export may use production canonical URLs. That can be acceptable for controlled staging, but it must be reviewed before sharing staging broadly or submitting staging sitemaps.

Do not submit staging sitemaps to search engines.

## Forms

If no static form endpoint is configured:

- submit attempt should show the static endpoint limitation/error
- form should not pretend success
- no request should require a Next `/api/contact` route from the static host

If a staging form endpoint is configured:

- endpoint is staging-safe
- endpoint is not cached
- CORS allows the staging origins
- no credentials are exposed in browser code

## Cloudflare Checks

If DNS-only:

- confirm Cloudflare cache headers are not expected
- validate Azure origin behavior directly

If proxied:

- confirm Cloudflare response headers are present
- confirm static assets are cacheable
- confirm HTML caching is conservative
- confirm form/API endpoint bypass is active
- confirm SSL mode is Full Strict when supported

## Final Staging Signoff

Before moving to live domains:

- Ice staging passes
- Roller staging passes
- form decision is approved
- DNS rollback notes are saved
- Cloudflare cache plan is approved
- Timothy approves live-domain cutover separately
