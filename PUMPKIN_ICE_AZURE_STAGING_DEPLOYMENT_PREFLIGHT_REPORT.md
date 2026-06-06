# Pumpkin Ice Azure Staging Deployment Preflight Report

Generated: 2026-06-06

## Scope

Approved action: Ice Azure staging deployment preflight only.

This pass reviewed the passing fresh CMS export, strict validators, existing Azure/static deployment docs, and read-only Azure discovery. It determined the staging target, package requirements, environment placeholders, smoke tests, rollback plan, and next approval boundary.

No Azure resource creation, Azure Static Web App creation, deployment, DNS change, Cloudflare change, CMS write, MediaAsset write, Function setting change, endpoint redeployment, email sending, Microsoft 365 change, production cutover, protected config read, generated artifact staging, or Roller work occurred.

## Current Readiness Summary

| Gate | Status |
| --- | --- |
| official fresh CMS-backed export verified | yes |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| contact form production readiness | yes for approved endpoint/config |
| static output quality gates | yes |
| Azure staging deployment preflight | yes |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Azure Discovery Result

Read-only Azure CLI discovery found:

- Azure CLI available, account enabled
- resource groups: `rg-ice-production-media`, `rg-ice-static-form-endpoint`, `DefaultResourceGroup-EUS`
- Static Web Apps: none found
- storage accounts: `iceforms20260605`, `iceskatingmedia`

No suitable existing Azure staging target was found. No tokens, keys, deployment tokens, connection strings, tenant IDs, or protected config values were printed.

## Chosen Staging Path

Selected option: Option A, Azure Static Web Apps staging, default hostname first.

Exact future target:

| Item | Value |
| --- | --- |
| Static Web App | `swa-ice-rink-rentals-staging` |
| resource group | `rg-pumpkin-static-staging` |
| region | `eastus`, unless a later approval chooses otherwise |
| artifact root | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` |
| first host to validate | Azure-generated default hostname |
| custom domain | not in first deployment |

Azure Storage static website remains a fallback only. Local package-only validation remains the current hold state until the separate deployment/resource creation approval is granted.

## Package Requirements

The future staging deployment should use the prebuilt Ice artifact only:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Required proof:

- routes exactly `/`, `/contact`, `/service-areas`
- support files include `404.html`, `sitemap.xml`, `robots.txt`, `redirects.json`, `static-publish-manifest.json`, and `_next/static/`
- no preview routes
- no obsolete routes
- no local `/media/ice-rink-rentals/...` URLs
- no public `latestSnapshot` payload
- media uses `media.iceskatingrinkrentals.com`
- static form endpoint uses the approved `/api/static-contact` URL
- no secrets or protected config in static output

Preflight validator rerun:

| Validator | Result |
| --- | --- |
| `npm run validate:snapshot:ice` | pass, 3 pages, 5 files, 0 errors |
| strict static output validator | pass, 42 files, 0 errors, 0 warnings |
| strict staging package validator | pass, 42 files, 0 errors, 0 warnings |

## Environment Placeholders

Future deployment token placeholder only:

```text
ICE_STAGING_SWA_DEPLOYMENT_TOKEN=<Azure Static Web Apps deployment token>
```

Future GitHub secret placeholder if automation is separately approved:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING=<Azure Static Web Apps deployment token>
```

Static output already uses the approved public form endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Browser submissions from a new SWA default hostname may require a separate Function allowed-origin setting update after the hostname exists. This preflight did not approve or perform Function setting changes.

## Smoke Test Plan

After a future approved deployment, validate the Azure default hostname first:

- `/`
- `/contact`
- `/service-areas`
- `/sitemap.xml`
- `/robots.txt`
- 404 behavior
- obsolete route behavior
- media image loading
- contact form UI loads
- safe endpoint `OPTIONS` check only
- sitemap/robots and canonical/meta checks
- noindex check
- mobile/responsive spot check
- source scan for secrets, localhost, local media URLs, `latestSnapshot`, and `CMS LIVE`

No valid form submission or email test is included unless separately approved.

## Rollback Plan

For staging failure:

- stop sharing the staging URL
- document default hostname, artifact root, commit SHA, timestamp, and failures
- redeploy prior known-good staging artifact if one exists and approval/policy allows
- if first deployment fails, leave staging unused or disable/delete only with approval
- do not change production DNS
- do not purge Cloudflare
- do not change CMS, MediaAsset, or Function settings without approval

Form rollback remains `FORM_DELIVERY_MODE=no-email` if email delivery must be disabled under a separate approved action.

## Next Approval Boundary

Because Option A is now selected, the safest next approval is:

```text
Ice Azure Static Web Apps default-host staging only.
```

That next approval must explicitly include resource creation and deployment if those are desired. It should still exclude custom DNS, Cloudflare/root/www changes, CMS writes, MediaAsset writes, Function setting changes, endpoint redeploy, valid form submission, email sending, Microsoft 365 changes, production deployment, and Roller work unless the user explicitly broadens the scope.

## Evidence Package

```text
deployment/azure/ice-azure-staging-deployment-preflight/
```
