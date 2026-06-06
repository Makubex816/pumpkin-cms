# Pumpkin Ice Production Cutover Preflight Report

Generated: 2026-06-06

## Scope

Approved action: Ice production cutover preflight only.

This pass reviewed completed staging readiness, Cloudflare DNS state, Azure Static Web Apps custom-domain requirements, root/www target planning, redirects/canonical expectations, rollback planning, and the final go/no-go checklist.

No DNS change, Cloudflare mutation, Azure custom-domain binding, production deployment, CMS write, MediaAsset write, Function App setting change, endpoint redeployment, email sending, Microsoft 365 change, protected config read, generated artifact staging, or Roller work occurred.

## Staging Readiness

Ice default-host staging is ready for the approved default-host boundary.

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
| Azure staging smoke test passed | yes |
| Azure staging readiness | yes for default-host staging |
| DNS cutover readiness | pending explicit approval |
| production/indexing readiness | not live-ready |
| Roller | paused |

Staging target:

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net
```

Approved staging routes returned 200, obsolete routes returned 404, static assets/media passed, strict validators passed, and form OPTIONS from staging/root/www origins passed.

## Azure Static Web Apps Preflight

Read-only Azure checks confirmed:

| Item | Value |
| --- | --- |
| Static Web App | `swa-ice-static-staging` |
| resource group | `rg-ice-static-staging` |
| location | `East US 2` |
| SKU | `Free` |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| provider | `SwaCli` |
| environment status | `Ready` |
| repository URL | none |
| branch | none |
| custom hostnames | none |

Azure CLI help for custom domains states that `az staticwebapp hostname set` requires a hostname and DNS provider records such as CNAME/TXT/ALIAS. The CLI default validation method is `cname-delegation`; `dns-txt-token` is also supported and is shown by CLI help for root domain validation.

No hostname binding was performed.

## Cloudflare DNS State

Cloudflare credentials were present and used for read-only API checks only. Token and zone ID values were not printed.

Zone:

| Item | Value |
| --- | --- |
| zone | `iceskatingrinkrentals.com` |
| status | active |
| paused | false |
| type | full |
| development mode | 0 |

Current selected DNS records:

| Name | Type | Target | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `www.iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `media.iceskatingrinkrentals.com` | CNAME | `iceskatingmedia.blob.core.windows.net` | true | auto |
| `iceskatingrinkrentals.com` | MX | `iceskatingrinkrentals-com.mail.protection.outlook.com` | false | auto |
| `iceskatingrinkrentals.com` | TXT | Microsoft 365 verification present | false | auto |
| `iceskatingrinkrentals.com` | TXT | SPF for Microsoft 365 present | false | auto |
| `autodiscover.iceskatingrinkrentals.com` | CNAME | `autodiscover.outlook.com` | false | auto |

Root and `www` are still DNS-only and still point to the current placeholder/current host IP, not Azure Static Web Apps.

## Public Baseline

Public HTTPS checks:

| URL | Result |
| --- | --- |
| `https://iceskatingrinkrentals.com` | unable to connect |
| `https://www.iceskatingrinkrentals.com` | unable to connect |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 200 |
| known `media.iceskatingrinkrentals.com` image URL | 200, Cloudflare served image |

Form endpoint safe OPTIONS checks returned 204 with matching allow-origin for:

- `https://iceskatingrinkrentals.com`
- `https://www.iceskatingrinkrentals.com`
- `https://happy-mud-0b375e20f.7.azurestaticapps.net`

No valid form payload was submitted and no email was sent.

## Recommended Cutover Strategy

Recommended canonical host: apex/root.

```text
https://iceskatingrinkrentals.com
```

Reason: the deployed static output already uses apex canonical URLs and sitemap URLs:

- `https://iceskatingrinkrentals.com/`
- `https://iceskatingrinkrentals.com/contact/`
- `https://iceskatingrinkrentals.com/service-areas/`

Recommended future execution path:

1. Use the existing `swa-ice-static-staging` default environment as the production custom-domain target unless a separate approval creates and deploys a production-named Static Web App first.
2. Bind `iceskatingrinkrentals.com` to Azure Static Web Apps with TXT validation for the root domain.
3. Bind `www.iceskatingrinkrentals.com` to Azure Static Web Apps with CNAME or TXT validation.
4. Change Cloudflare DNS for root and `www` only after Azure validation/binding requirements are known.
5. Keep root and `www` DNS-only for the first production smoke test to isolate Azure origin behavior.
6. Prefer a later Cloudflare redirect rule from `www` to apex, or defer the redirect and rely on apex canonical tags until redirect approval is granted.
7. Keep `media.iceskatingrinkrentals.com` unchanged.
8. Keep Microsoft 365 MX/TXT/autodiscover unchanged.
9. Run the final production smoke test before any indexing/search submission.

If using a resource named `staging` for production custom domains is not acceptable, stop and request separate approval for a production Static Web App resource and deployment before DNS cutover.

## Redirects And Canonicals

Current `redirects.json` has zero redirect rules. Obsolete routes return 404 on staging:

- `/ice-rink-rentals`
- `/events-holiday-activations`

Root should remain canonical. `www` should either:

- redirect permanently to root after separate Cloudflare redirect approval, or
- serve the same content temporarily with canonical tags pointing to root.

Do not submit staging sitemaps to search engines. Production indexing remains not live-ready until root/www production smoke tests pass.

## Rollback Plan

Primary DNS rollback target:

```text
iceskatingrinkrentals.com A 66.81.203.198 DNS-only
www.iceskatingrinkrentals.com A 66.81.203.198 DNS-only
```

Rollback if cutover fails:

1. Restore prior root and `www` DNS records.
2. Disable or remove any new Cloudflare redirect rule only if one was added under the future cutover approval.
3. Leave `media.iceskatingrinkrentals.com` unchanged.
4. Leave the Azure staging default hostname intact.
5. Remove Azure custom-domain binding only with explicit approval if needed.
6. Do not touch CMS, MediaAsset records, Function settings, Microsoft 365, or Roller for DNS rollback.

If form behavior fails under a separately approved valid form test, the known form rollback remains `FORM_DELIVERY_MODE=no-email` under explicit Function setting approval.

## Go/No-Go

Preflight result: go for an explicit production cutover approval boundary, no-go for any automatic production cutover.

Go conditions already satisfied:

- staging content routes pass
- staging media passes
- staging form OPTIONS passes
- strict validators pass
- Cloudflare current root/www rollback values captured
- root/www are DNS-only
- media and Microsoft 365 records are identified and should remain untouched

Still required before cutover execution:

- explicit DNS/Cloudflare/Azure custom-domain approval
- exact Azure validation records/tokens captured during binding workflow without printing secrets if any
- final decision on `www` redirect versus canonical-only
- maintenance window/rollback owner
- final smoke-test acceptance criteria

## Evidence Package

```text
deployment/azure/ice-production-cutover-preflight/
```
