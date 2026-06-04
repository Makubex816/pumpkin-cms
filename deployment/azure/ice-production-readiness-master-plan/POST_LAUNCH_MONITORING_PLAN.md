# Post-Launch Monitoring Plan

Generated: 2026-06-04

## Scope

Planning only. No monitoring tools were configured in this run.

## First-Hour Checks

- open `/`
- open `/contact`
- open `/service-areas`
- open `/sitemap.xml`
- open `/robots.txt`
- verify media loading
- verify static assets load
- verify Cloudflare/Azure error rates
- verify endpoint logs if contact form is approved
- verify no real email failures if email is approved

## First-Day Checks

- review Azure Static Web App health
- review Cloudflare cache and error analytics
- review media hostname behavior
- review contact form submissions if endpoint is live
- review search indexing signals only after indexing approval
- confirm no unexpected obsolete routes

## Ongoing Checks

- route uptime
- form endpoint health
- media 404s
- Cloudflare error rates
- Azure errors
- cache purge needs
- CMS publish workflow notes
- lead delivery/notification health if enabled

## Alerting Planning

Future approval may add:

- Azure alerts
- endpoint error alerts
- Cloudflare monitoring
- form submission failure alerts
- media 404 alerts

## Current Run Result

Monitoring plan documented only. No monitoring was configured.

