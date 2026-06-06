# Indexing Readiness Recheck

Generated: 2026-06-06

## Static Output Recheck

Local deployable output passed:

- approved route files exist for `/`, `/contact`, and `/service-areas`
- obsolete/preview deployable paths are absent
- robots meta is `index,follow`
- no `noindex` found on approved pages
- canonical tags use apex production URLs with trailing slashes
- sitemap URLs match canonical trailing-slash behavior
- hidden workflow/review blocker strings were absent from deployable output
- 8 production media URLs checked with 0 failures
- form `OPTIONS` checks passed for apex, `www`, and Azure default host origins

## Static Redeploy

After the user explicitly approved redeploying static output, the cleaned artifact was deployed with Azure Static Web Apps CLI:

```powershell
npx -y @azure/static-web-apps-cli deploy "apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out" --env production --app-name swa-ice-static-staging --resource-group rg-ice-static-staging
```

Result:

| Check | Result |
| --- | --- |
| command exit code | 0 |
| Static Web App | `swa-ice-static-staging` |
| resource group | `rg-ice-static-staging` |
| environment | `production` environment on the existing SWA |
| default hostname | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |

The SWA CLI wrote a local ignored `.env` credential cache file. It was removed without reading or printing its contents.

## Live Production Recheck After Redeploy

Checked:

- `https://iceskatingrinkrentals.com/`
- `https://iceskatingrinkrentals.com/contact`
- `https://iceskatingrinkrentals.com/service-areas`
- `https://www.iceskatingrinkrentals.com/`
- `https://www.iceskatingrinkrentals.com/contact`
- `https://www.iceskatingrinkrentals.com/service-areas`
- `https://happy-mud-0b375e20f.7.azurestaticapps.net/`
- `https://happy-mud-0b375e20f.7.azurestaticapps.net/contact`
- `https://happy-mud-0b375e20f.7.azurestaticapps.net/service-areas`

All approved routes returned 200.

## Live Indexing Signals

| Check | Result |
| --- | --- |
| titles present | yes |
| descriptions present | yes |
| robots meta | `index,follow` |
| noindex | absent |
| canonical host | apex production host |
| `/` canonical | `https://iceskatingrinkrentals.com/` |
| `/contact` canonical | `https://iceskatingrinkrentals.com/contact/` |
| `/service-areas` canonical | `https://iceskatingrinkrentals.com/service-areas/` |
| hidden workflow/review blocker hits | 0 |

## Sitemap and Robots

Live `sitemap.xml` returned 200 from apex, `www`, and the Azure default hostname and listed:

- `https://iceskatingrinkrentals.com/contact/`
- `https://iceskatingrinkrentals.com/`
- `https://iceskatingrinkrentals.com/service-areas/`

Live `robots.txt` returned 200, did not globally disallow indexing, and references:

```text
https://iceskatingrinkrentals.com/sitemap.xml
```

## Obsolete and Preview Routes

The checked obsolete/preview routes returned 404 on apex and `www`:

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/draft-preview`
- `/draft-preview/ice-rink-rentals`
- `/phase-5a-csv-import-54754949`
- `/api/preview`
- `/preview`
- arbitrary missing route

## Media and Form

8 production media URLs were checked with 0 failures.

Safe form `OPTIONS` checks returned 204 and the matching allowed origin for:

- `https://iceskatingrinkrentals.com`
- `https://www.iceskatingrinkrentals.com`
- `https://happy-mud-0b375e20f.7.azurestaticapps.net`

No valid form payload was submitted. No email was sent.
