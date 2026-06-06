# Pumpkin Ice Production Cutover Result Report

Generated: 2026-06-06

## Result

Ice production custom-domain and DNS cutover completed successfully.

| Area | Result |
| --- | --- |
| Azure Static Web App | `swa-ice-static-staging` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| apex domain | `iceskatingrinkrentals.com` Ready |
| www domain | `www.iceskatingrinkrentals.com` Ready |
| root DNS | DNS-only CNAME to Azure default hostname |
| www DNS | DNS-only CNAME to Azure default hostname |
| production smoke | pass |
| strict static output validator | pass |
| strict staging package validator | pass |
| rollback plan | documented |
| Roller | paused |

## What Changed

- Added Azure Static Web Apps validation TXT records for the approved custom-domain binding. Token values were not recorded in repository docs.
- Bound `iceskatingrinkrentals.com` to `swa-ice-static-staging`.
- Bound `www.iceskatingrinkrentals.com` to `swa-ice-static-staging`.
- Updated Cloudflare root DNS from A `66.81.203.198` to DNS-only CNAME `happy-mud-0b375e20f.7.azurestaticapps.net`.
- Updated Cloudflare `www` DNS from A `66.81.203.198` to DNS-only CNAME `happy-mud-0b375e20f.7.azurestaticapps.net`.

## What Was Preserved

- `media.iceskatingrinkrentals.com` Cloudflare Worker-backed media path
- root MX record
- SPF TXT record
- Microsoft 365 verification TXT record
- `autodiscover.iceskatingrinkrentals.com`

## Production Verification

Production HTTPS smoke passed on both apex and `www`:

- `/`, `/contact`, `/service-areas`, `/sitemap.xml`, and `/robots.txt` returned 200
- `/ice-rink-rentals`, `/events-holiday-activations`, and an arbitrary missing route returned 404
- 30 static assets passed
- 9 media URLs passed
- page hygiene checks passed for canonical URLs, no `noindex`, no `latestSnapshot`, no `CMS LIVE`, no localhost, no local media paths, no Roller brand strings, and no Azure staging hostname in production HTML
- form `OPTIONS` checks passed for apex and `www`

No valid form payload was submitted and no email was sent.

## Validators

| Validator | Result |
| --- | --- |
| Ice snapshot validator with approved public form endpoint env | pass, 0 errors |
| CMS snapshot static-publish validator with approved public form endpoint env | pass, 0 errors |
| strict static output validator | pass, 42 files, 0 errors, 0 warnings |
| strict staging package validator | pass, 42 files, 0 errors, 0 warnings |

## Rollback

Rollback is documented in `deployment/azure/ice-production-cutover-result/ROLLBACK_PLAN.md`.

Fast rollback target:

- restore `iceskatingrinkrentals.com` A `66.81.203.198`, DNS-only, TTL auto
- restore `www.iceskatingrinkrentals.com` A `66.81.203.198`, DNS-only, TTL auto

Do not change media, MX, SPF, Microsoft 365 TXT, or autodiscover records during DNS rollback.

## Boundary Confirmation

No CMS writes, MediaAsset writes, Function setting changes, endpoint redeploys, email sending, Microsoft 365 changes, new static deployments, production artifact rebuilds, Cloudflare non-DNS changes, protected config reads, Search Console/indexing changes, or Roller work were performed.

## Result Package

See `deployment/azure/ice-production-cutover-result/`.

## Post-Cutover Indexing Cleanup Update

After cutover, the production indexing preflight found hidden serialized CMS review payload text and sitemap/canonical trailing-slash drift. The user later approved cleanup and then approved redeploying the cleaned static output.

Current status:

| Area | Result |
| --- | --- |
| static output redeployed after cleanup | yes |
| hidden workflow/review payload in live public HTML | cleared |
| sitemap/canonical trailing slash alignment | cleared |
| live production indexing readiness | yes |
| Search Console submission | not performed; separate approval required |

No DNS, Cloudflare, Azure custom-domain, CMS, MediaAsset, Function setting, endpoint, email, Microsoft 365, or Roller changes were made in the indexing cleanup.
