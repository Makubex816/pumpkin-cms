# Monitoring and Logging Plan

Generated: 2026-06-06

## Result

Monitoring points are identified. No monitoring settings, alerts, dashboards, Cloudflare settings, Azure settings, Function settings, or Microsoft 365 settings were changed.

## Azure Static Web Apps

Monitor:

- `swa-ice-static-staging` resource health
- default hostname `happy-mud-0b375e20f.7.azurestaticapps.net`
- custom hostnames `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`
- deployment history and active production environment
- 4xx/5xx trends if available
- static asset failures

First-hour/first-day checks:

- `/`
- `/contact/`
- `/service-areas/`
- `/sitemap.xml`
- `/robots.txt`
- obsolete/preview 404 routes

## Cloudflare DNS and Media Worker

Monitor:

- root and `www` DNS continuing to resolve to Azure Static Web Apps path
- `media.iceskatingrinkrentals.com` proxied DNS status
- Worker route `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*`
- Worker script `ice-media-delivery`
- Worker request volume, errors, and subrequest/origin failures
- media cache behavior and 404/5xx rates

Do not change DNS, Worker routes, cache rules, SSL/TLS, page rules, redirects, or Cloudflare settings without separate approval.

## Azure Blob Media

Monitor:

- availability of the 9 approved media blobs
- unexpected media 404s
- content type `image/png`
- cache-control stability
- container/blob access errors

Avoid blob deletion or upload changes without separate media approval.

## Static Contact Function

Monitor:

- Function App `func-ice-static-contact-20260605`
- endpoint `/api/static-contact`
- safe preflight `OPTIONS` behavior for apex and `www`
- POST success/failure rates after form submissions occur
- validation failures and spam/consent failures
- Graph delivery failures
- cold start or timeout errors

Do not change app settings, delivery mode, endpoint code, or deploy the endpoint without separate approval.

## Microsoft 365 and Exchange

Monitor only after approved form submissions:

- Exchange message trace for delivered/failed leads
- sender identity health
- recipient mailbox delivery
- duplicate delivery or quarantine behavior
- mailbox triage and response workflow

No mailbox contents were accessed in this preflight.

## Form Submission Oversight

Monitor:

- form entries created by valid submissions
- sanitization and required-field validation
- no duplicate unexpected messages
- response ownership and lead follow-up timing
- failed submissions surfaced to the owner

No valid form submission was sent in this preflight.

## Route and Indexing Signals

Monitor:

- approved route 200 status
- obsolete/preview route 404 status
- sitemap contents
- robots.txt content
- canonical tags
- noindex absence on approved routes
- hidden workflow/review blocker strings

Search Console monitoring must wait until separate final indexing approval.

## Analytics and Tracking

No analytics/tracking implementation was detected on checked live pages. If analytics is desired before or after indexing, it requires a separate approval and implementation plan.
