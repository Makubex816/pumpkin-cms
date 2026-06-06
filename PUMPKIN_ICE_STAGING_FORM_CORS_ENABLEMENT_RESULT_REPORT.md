# Pumpkin Ice Staging Form CORS Enablement Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice staging form CORS/origin enablement only.

This pass updated only the approved static contact Function allowed-origin app setting needed to allow the Azure Static Web Apps staging default origin:

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net
```

No endpoint redeploy, Azure resource creation, CMS write, MediaAsset write, Cloudflare change, static deployment, production deployment, root/www DNS change, Microsoft 365 change, valid form lead submission, email sending, protected config read, or Roller work occurred.

## Target

| Item | Value |
| --- | --- |
| Function App | `func-ice-static-contact-20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Approved staging origin | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| Setting changed | `STATIC_FORM_ALLOWED_ORIGINS` |

The Function App remained `Running`.

## Setting Change

Before:

```text
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
```

After:

```text
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com,https://happy-mud-0b375e20f.7.azurestaticapps.net
```

Readback also confirmed:

- `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`
- `FORM_DELIVERY_MODE=graph`
- no wildcard origin was introduced
- production root and `www` origins remain allowed

Only safe non-secret setting values were printed.

## Pre-Change OPTIONS Result

Before the setting change:

| Origin | Status | Allow-Origin | Result |
| --- | --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | none | blocked |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` | allowed |

## Post-Change OPTIONS Result

After the setting change:

| Origin | Status | Allow-Origin | Allow-Methods | Allow-Headers |
| --- | --- | --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | `https://happy-mud-0b375e20f.7.azurestaticapps.net` | `OPTIONS, POST` | `Content-Type` |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |
| `https://www.iceskatingrinkrentals.com` | 204 | `https://www.iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |

Staging browser-origin preflight readiness is now yes.

## Safe Invalid Payload Check

An invalid empty JSON POST was sent from the staging origin to verify browser-origin response headers without submitting a valid lead:

| Check | Result |
| --- | --- |
| status | 400 |
| allow-origin | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| response ok | false |
| message | `Please check the highlighted form fields.` |
| valid payload sent | no |
| email sent | no |

## Staging Contact Page Recheck

The staging contact page loaded:

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net/contact
```

Checks:

- status 200
- form endpoint URL present
- form UI present
- no local `/media/ice-rink-rentals` references
- no `latestSnapshot`
- no `CMS LIVE`

No static redeployment occurred.

## Readiness Classification

| Gate | Status |
| --- | --- |
| official fresh CMS-backed export verified | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| contact form production readiness | yes |
| static output quality gates | yes |
| Azure staging resource readiness | yes |
| Azure staging deployment completed | yes |
| staging form browser-origin readiness | yes |
| Azure staging smoke test passed | yes for approved default-host/OPTIONS boundary |
| Azure staging readiness | yes for default-host staging; no production cutover approval |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Remaining Boundaries

Still not approved or performed:

- valid staging form lead submission
- email sending from a staging-origin valid payload
- endpoint redeploy
- CMS writes
- MediaAsset writes
- Cloudflare changes
- DNS changes
- static deployment
- production cutover
- Microsoft 365 changes
- Roller work

## Evidence Package

```text
deployment/azure/ice-staging-form-cors-enablement-result/
```
