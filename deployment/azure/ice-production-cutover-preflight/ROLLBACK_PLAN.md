# Rollback Plan

Generated: 2026-06-06

## Current Rollback Values

Current root/www records from read-only Cloudflare API:

```text
iceskatingrinkrentals.com A 66.81.203.198 DNS-only
www.iceskatingrinkrentals.com A 66.81.203.198 DNS-only
```

Keep a private rollback note at execution time with Cloudflare record IDs and exact before/after values. Do not print tokens or protected config.

## Rollback Triggers

- root or `www` does not resolve to the intended host
- HTTPS/certificate validation fails
- `/`, `/contact`, or `/service-areas` fails
- sitemap or robots is wrong
- media fails to load
- form OPTIONS fails
- wrong brand/content appears
- unexpected noindex appears
- Cloudflare cache/proxy behavior interferes

## Rollback Steps

After explicit rollback approval or under a separately approved incident policy:

1. Restore root A record to `66.81.203.198`, DNS-only.
2. Restore `www` A record to `66.81.203.198`, DNS-only.
3. Remove or disable any new `www` redirect rule only if one was added.
4. Leave `media.iceskatingrinkrentals.com` unchanged.
5. Leave MX/TXT/autodiscover unchanged.
6. Keep Azure staging default hostname intact.
7. Remove Azure custom-domain binding only with explicit approval if necessary.
8. Run rollback smoke tests on root, `www`, staging default host, media, and form OPTIONS.

## Form Rollback

If a separately approved valid form test exposes email behavior problems, the known Function rollback is:

```text
FORM_DELIVERY_MODE=no-email
```

That is a Function App setting change and requires explicit approval.

## Not Rollback Mechanisms

Do not rollback DNS issues by changing:

- CMS content
- MediaAsset records
- Microsoft 365 settings
- endpoint code
- static artifact content
- Roller state
