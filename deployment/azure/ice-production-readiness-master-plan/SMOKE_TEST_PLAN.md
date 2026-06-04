# Smoke Test Plan

Generated: 2026-06-04

## Pages To Test

- `/`
- `/contact`
- `/service-areas`
- `/sitemap.xml`
- `/robots.txt`

## Page Checks

- page returns HTTP 200
- page title and main content are correct
- navigation links work
- footer links work
- no obsolete route links are visible
- no opposite-site branding appears
- mobile/responsive layout works
- CSS and JavaScript assets load without 404s
- source contains no secrets
- source contains no localhost media URLs after media gate completes

## Media Checks

- hero images load
- card images load
- logo images load
- partner logo imagery loads
- media URLs use `media.iceskatingrinkrentals.com`
- image requests return expected cache headers

## Contact Form Checks

Only after endpoint approval:

- form renders on `/contact`
- form renders where expected on `/`
- submission goes to approved endpoint
- invalid payloads fail safely
- valid staging payload creates the expected destination record
- no real email is sent unless explicitly approved

## SEO Checks

- no unintended `noindex`
- canonical URLs are expected
- sitemap uses production domain only during production/cutover
- robots references expected sitemap

## Monitoring During Smoke Test

- watch Azure origin errors
- watch Cloudflare errors/cache behavior when proxied
- watch endpoint logs if form test is approved
- record results and blockers

## Current Run Result

Smoke test plan documented only. No staging or production smoke test was run.

