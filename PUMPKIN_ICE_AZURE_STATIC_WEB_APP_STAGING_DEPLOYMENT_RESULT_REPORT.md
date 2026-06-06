# Pumpkin Ice Azure Static Web App Staging Deployment Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice Azure Static Web Apps staging deployment only.

This pass refreshed the live-CMS-backed Ice static export, reran strict validators, deployed the already validated Ice static artifact to the existing Azure Static Web App staging resource, verified the Azure default hostname, ran public default-host smoke tests, and documented the results.

No custom domain, production deployment, production DNS cutover, root/www DNS change, Cloudflare change, CMS write, MediaAsset write, Function App setting change, endpoint redeployment, email sending, Microsoft 365 change, production cutover, generated static artifact staging, or Roller work occurred.

## Deployment Target

| Item | Value |
| --- | --- |
| resource group | `rg-ice-static-staging` |
| Static Web App | `swa-ice-static-staging` |
| location | `East US 2` |
| SKU | `Free` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| custom hostnames | none |
| provider after deployment | `SwaCli` |
| default environment status | `Ready` |

Deployment token use was required by the SWA CLI. It was retrieved into a transient shell variable/environment variable, used for deployment, then cleared. The token was not printed, written to docs, committed, or staged.

## Deployment Artifact

The deployed artifact was:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

The folder contained 42 files and the approved content routes:

- `/`
- `/contact`
- `/service-areas`

Support files included `404.html`, `404/index.html`, `sitemap.xml`, `robots.txt`, `redirects.json`, `static-publish-manifest.json`, and `_next/static/`.

No Roller content, preview routes, obsolete route folders, local media URLs, public `latestSnapshot` payloads, or protected config files were detected in the validated artifact.

## Pre-Deployment Recheck

The full CMS-backed export was rerun successfully:

```text
npm run export:static:ice:cms
```

Result:

- snapshot ok
- page count: 3
- published count: 3
- approved slugs: `contact`, `home`, `service-areas`
- excluded slugs: `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949`
- generated artifact: `apps/ice-rink-web/.static-artifacts/ice-rink-rentals`

Expected content warnings remained for `staticPublishing.needsRebuild`, missing fulfillment status, and service-area disclosure review. The strict validators still passed.

## Validator Result

| Validator | Result |
| --- | --- |
| `npm run validate:snapshot:ice` with approved form env | pass, 3 pages, 5 files, 0 errors |
| strict static output validator | pass, 42 files, 0 errors, 0 warnings |
| strict staging package validator | pass, 42 files, 0 errors, 0 warnings |

## Staging Smoke Result

Default host tested:

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net
```

Passing checks:

- `/` returned 200
- `/contact` returned 200
- `/service-areas` returned 200
- `/sitemap.xml` returned 200
- `/robots.txt` returned 200
- `/__ice-staging-smoke-missing-route` returned 404
- `/ice-rink-rentals` returned 404
- `/events-holiday-activations` returned 404
- 15 static asset URLs returned 200
- 9 media URLs from `media.iceskatingrinkrentals.com` returned 200
- approved pages had no `noindex` robots meta
- approved pages had no `latestSnapshot`, `CMS LIVE`, local `/media/ice-rink-rentals`, localhost, or Roller strings
- `/contact` contained the approved static form endpoint URL
- `/404` and `/404.html` returned 200 and contained `noindex`

Observed blocker:

- safe `OPTIONS` check to `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` from origin `https://happy-mud-0b375e20f.7.azurestaticapps.net` returned 204 but did not include CORS allow-origin headers for the staging hostname
- the same safe `OPTIONS` check from origin `https://iceskatingrinkrentals.com` returned 204 with `Access-Control-Allow-Origin: https://iceskatingrinkrentals.com`

No valid contact form payload was submitted and no email was sent.

## Readiness Classification

| Gate | Status |
| --- | --- |
| official fresh CMS-backed export verified | yes |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| contact form production readiness | yes for production origin; staging origin blocked by CORS |
| static output quality gates | yes |
| Azure staging resource readiness | yes |
| Azure staging deployment completed | yes |
| Azure staging smoke test passed | partial, content/media/routes pass; form staging-origin CORS blocked |
| Azure staging readiness | no, because staging-origin browser form submission is not CORS-ready |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Remaining Blockers

Before treating staging as fully ready, the staging hostname needs a separately approved Function allowed-origin decision or an explicit decision to defer browser form submission testing on staging.

Production cutover remains unapproved. DNS, Cloudflare, custom domain, Function settings, endpoint redeploy, valid form submission, email/Microsoft 365 work, CMS/MediaAsset writes, and Roller work remain outside this deployment result.

## Evidence Package

```text
deployment/azure/ice-azure-static-web-app-staging-deployment-result/
```
