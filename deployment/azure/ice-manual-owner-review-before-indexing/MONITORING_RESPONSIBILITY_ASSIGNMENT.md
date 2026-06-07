# Monitoring Responsibility Assignment

Generated: 2026-06-06

## Status

Monitoring points are documented in prior reports. Human ownership remains pending.

No monitoring settings, alerts, dashboards, Cloudflare settings, Azure settings, Function settings, Microsoft 365 settings, or Search Console monitoring were changed in this package.

## Owner Assignments

| Area | Assigned owner | Notes |
| --- | --- | --- |
| Azure Static Web App owner | TBD | Monitor resource health, custom domains, deployment history, asset failures, and 4xx/5xx trends where available. |
| Cloudflare/DNS owner | TBD | Monitor apex, `www`, media DNS, Worker route, and DNS drift. |
| form endpoint owner | TBD | Monitor Function health, OPTIONS behavior, POST failures, validation failures, and Graph delivery issues. |
| Microsoft 365 inbox owner | TBD | Monitor `contact@iceskatingrinkrentals.com`, delivery, duplicates, quarantine, and lead response flow. |
| media delivery owner | TBD | Monitor media URL availability, media 404s, content type, cache behavior, and Worker/origin failures. |
| error/404 monitoring owner | TBD | Monitor approved route 200s, obsolete/preview 404s, broken links, sitemap, robots, canonical tags, and noindex absence. |
| analytics/reporting owner | TBD | Only applies if analytics is separately approved later. |
| escalation contact | TBD | Primary person to contact for production availability, form delivery, or indexing anomalies. |

## First-Day Manual Checks

- [ ] Confirm apex `/`, `/contact/`, `/service-areas/`, `/sitemap.xml`, and `/robots.txt`.
- [ ] Confirm `www` `/`, `/contact/`, `/service-areas/`, `/sitemap.xml`, and `/robots.txt`.
- [ ] Confirm obsolete/preview routes still return 404.
- [ ] Confirm contact inbox owner has access and understands lead workflow.
- [ ] Confirm no unexpected duplicate messages are appearing.
- [ ] Confirm media renders from `media.iceskatingrinkrentals.com`.
- [ ] Confirm no owner-visible content regressions.

Search Console monitoring remains blocked until final indexing approval.

