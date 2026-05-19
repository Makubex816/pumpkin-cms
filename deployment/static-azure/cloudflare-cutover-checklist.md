# Cloudflare Cutover Checklist

This checklist is for planning only. Do not change DNS or Cloudflare settings until the hosting target and rollback path are approved.

## Record Existing DNS First

Before changing anything, document:

- current apex record for `iceskatingrinkrentals.com`
- current `www` record for `iceskatingrinkrentals.com`
- current apex record for `rollerrinkrentals.com`
- current `www` record for `rollerrinkrentals.com`
- TTL values
- proxy status
- any page rules, redirect rules, cache rules, WAF rules, and workers

Store this outside the repo if it contains account-specific details.

## Staging Subdomains

Recommended staging domains:

- `ice-dev.iceskatingrinkrentals.com`
- `roller-dev.rollerrinkrentals.com`

Use staging first to validate Azure origin, TLS mode, cache rules, routes, and form behavior before touching live domains.

## Orange-Cloud Vs DNS-Only

Orange-cloud proxied:

- Cloudflare CDN/WAF/cache applies.
- Cloudflare SSL/TLS mode matters.
- Cache and bypass rules can protect or break behavior.

DNS-only:

- Browser talks directly to Azure origin.
- Cloudflare cache/WAF rules do not apply.
- Useful for origin debugging.

## Cache Bypass Rules

Bypass:

- `/api/*`
- `/api/static-contact`
- `/admin/*`
- `/login*`
- `/dashboard/*`
- external form endpoint if proxied through Cloudflare

Do not cache POST responses.

## Static Asset Cache Rules

Cache aggressively:

- `/_next/static/*`
- `.js`
- `.css`
- `.woff2`
- `.png`
- `.jpg`
- `.webp`
- `.svg`
- `.ico`

Use long TTLs only for immutable hashed assets.

## HTML Cache Caution

Keep HTML routes conservative until purge automation exists:

- `/`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/roller-rink-rentals`
- `/contact`

After purge is proven, HTML caching can be increased carefully.

## Form Endpoint Bypass

Static contact forms need an external endpoint.

Confirm:

- endpoint is not cached
- CORS allows approved origins only
- spam/rate-limit controls exist
- no credentials are exposed in browser code

## SSL Full Strict Guidance

Recommended production mode:

```text
Full (strict)
```

Only use Full Strict when the Azure origin has valid TLS for the hostname Cloudflare connects to.

Avoid Flexible mode for production.

## Cutover Steps

1. Confirm staging validation passed.
2. Confirm rollback artifact and DNS rollback notes are ready.
3. Lower TTL before planned cutover if needed.
4. Update DNS records for the chosen domain.
5. Enable orange-cloud proxy only when cache/bypass rules are ready.
6. Verify HTTPS.
7. Verify key routes.
8. Verify sitemap and robots.
9. Verify form behavior.
10. Keep HTML cache conservative.

## Rollback Steps

1. Revert DNS records to previous documented values.
2. Re-upload previous artifact if the Azure artifact caused the issue.
3. Purge Cloudflare cache after rollback.
4. Verify `/`, primary route, `/contact`, `/sitemap.xml`, and `/robots.txt`.
5. Record the incident and root cause.

## Post-Cutover Verification

For each live domain:

- open `/`
- open primary rental route
- open `/contact`
- open `/sitemap.xml`
- open `/robots.txt`
- inspect canonical tags
- verify no opposite-domain references
- verify Cloudflare cache headers
- test form only when a staging-safe endpoint exists
