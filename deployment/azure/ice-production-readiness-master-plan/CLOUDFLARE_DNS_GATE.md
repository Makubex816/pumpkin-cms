# Cloudflare DNS Gate

Generated: 2026-06-04

## Current Status

DNS/cutover remains blocked.

No Cloudflare or DNS changes occurred in this run.

## Expected Domains

- `iceskatingrinkrentals.com`
- `www.iceskatingrinkrentals.com`, if used
- `media.iceskatingrinkrentals.com`

## Certificate And HTTPS Considerations

- Azure origin HTTPS must be valid for the chosen hosting path.
- Cloudflare SSL mode should be compatible with the Azure origin.
- Production should avoid Flexible SSL.
- Media hostname HTTPS must be validated before media readiness is marked `yes`.

## Redirect And Canonical Considerations

- decide apex versus `www` canonical behavior
- confirm canonical tags on `/`, `/contact`, and `/service-areas`
- confirm sitemap URLs use the intended production host
- confirm redirects do not expose obsolete routes
- keep staging sitemaps out of search engine submission

## Future Cutover Preconditions

- Azure staging passes
- rollback DNS notes are recorded outside the repo if account-specific
- Cloudflare cache and bypass rules are approved
- form/API endpoint bypass is confirmed if proxied
- production cutover approval is explicit

## Explicit No-Action Statement

No DNS records, Cloudflare cache rules, workers, proxy settings, SSL settings, or purges were changed in this run.

