# Final Production Smoke Test Plan

Generated: 2026-06-06

## Hosts

Test after future cutover approval and execution:

```text
https://iceskatingrinkrentals.com
https://www.iceskatingrinkrentals.com
```

## Routes

Required checks:

- `/`
- `/contact`
- `/service-areas`
- `/sitemap.xml`
- `/robots.txt`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- an arbitrary missing route

Expected:

- approved content routes return 200
- sitemap and robots return 200
- obsolete routes return 404 or approved redirect behavior
- missing route returns 404

## Page Checks

- title and visible content match Ice
- no Roller branding
- no `latestSnapshot`
- no `CMS LIVE`
- no localhost references in page HTML
- no local `/media/ice-rink-rentals` URLs
- approved pages do not contain noindex
- canonical URLs use `https://iceskatingrinkrentals.com`
- sitemap URLs use `https://iceskatingrinkrentals.com`
- robots references the production sitemap
- CSS and JavaScript assets return 200
- mobile/responsive spot check passes

## Media Checks

- at least one hero/media URL loads from `media.iceskatingrinkrentals.com`
- media remains served through Cloudflare Worker path
- no media DNS changes were required

## Form Checks

Safe checks only unless separately approved:

- `/contact` form UI loads
- endpoint URL is present
- OPTIONS from `https://iceskatingrinkrentals.com` returns 204 with matching allow-origin
- OPTIONS from `https://www.iceskatingrinkrentals.com` returns 204 with matching allow-origin

Do not submit a valid form payload or send email unless explicitly approved.

## Infrastructure Checks

- Azure custom domains show as configured
- Cloudflare root and `www` records match the approved target
- Cloudflare media/MX/TXT/autodiscover records remain unchanged
- no Cloudflare cache rule is caching POST/API responses
