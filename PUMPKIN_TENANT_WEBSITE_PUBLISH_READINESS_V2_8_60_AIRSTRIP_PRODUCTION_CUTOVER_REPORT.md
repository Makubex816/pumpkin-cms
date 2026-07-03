# V2.8.60 Airstrip Production Cutover Report

Phase status: `production_default_host_live_bluehost_dns_owner_action_required`.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `airstrip_production_cutover_bluehost_dns_no_indexing`.

## V2.8.59 Carryforward

- Owner approved the isolated Airstrip preview for production cutover.
- Isolated preview remained healthy at `https://app-airstrip-preview-isolated-centralus-001.azurewebsites.net`.
- Isolated routes `/`, `/request-booking`, `/packages`, and `/airstrip-the-club` returned HTTP 200.
- Airstrip page readiness was already repaired for 5 pages.
- Ice no-regression had passed before this phase.

## Pre-Cutover Health

Result: passed.

- Airstrip isolated preview key routes: HTTP 200.
- Airstrip public page API reads: HTTP 200 for all 5 expected slugs.
- Airstrip FormDefinition, theme, and sitemap reads: HTTP 200.
- Airstrip media readback: 13 of 13 MediaAsset records, all Airstrip tenant, all first public media URLs HTTP 200.
- Airstrip TenantAdmin login: passed.
- Ice baseline: passed.

## Production App Service

Result: passed.

- App Service: `app-airstrip-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Plan: `asp-pumpkin-api-prod-centralus-001`.
- Runtime: `NODE|22-lts`.
- Startup command: `node server.js`.
- Default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- App was missing at phase start and was created on the approved existing Linux App Service plan.
- Configured source-required runtime settings by name only. Secret values were not printed or written.

## Production Deployment

Result: passed.

- Production deploy count this phase: 1.
- Deployment target: `app-airstrip-prod-centralus-001`.
- Deployment artifact: ignored `.tmp` POSIX ZIP.
- Deployment ID: `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-pumpkin-api-prod-centralus/providers/Microsoft.Web/sites/app-airstrip-prod-centralus-001/deploymentStatus/54ce2939-fad0-4b76-a0cd-3467972e2524`.
- Azure CLI reported deployment completed successfully.

## Default Host Proof

Result: passed.

Production default host:

`https://app-airstrip-prod-centralus-001.azurewebsites.net`

Routes:

- `/`: HTTP 200, Airstrip content present, Ice content absent.
- `/request-booking`: HTTP 200, Airstrip content present, Ice content absent.
- `/packages`: HTTP 200, Airstrip content present, Ice content absent.
- `/airstrip-the-club`: HTTP 200, Airstrip content present, Ice content absent.

Browser diagnostics:

- Console errors: 0.
- Failed requests: 0.
- HTTP 4xx/5xx browser responses: 0.
- Missing image assets: 0.
- Airstrip text present: true.
- Ice text present: false.

## Screenshot Proof

Visual review folder:

`C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60-airstrip-production-cutover\`

Files:

- `airstrip-production-default-homepage-above-fold.png`
- `airstrip-production-default-homepage-fullpage.png`
- `VISUAL_REVIEW_README.md`
- `render-diagnostics.json`
- `screenshot-checksums.sha256`

Checksums:

- `42cdcf3f7621a58dacf8d7fd1a6d03ff837f1d9418d3a2495168ee698ca07008  airstrip-production-default-homepage-above-fold.png`
- `579f3b7d7701b2b8a9e6dc96b98895cb4ad9980fbee1c40391350267289968be  airstrip-production-default-homepage-fullpage.png`

## Bluehost DNS And Custom Domain

Result: production default host live; Bluehost DNS owner action required.

No custom domain was bound in this phase.

Read-only DNS/Azure validation state:

- App Service external IP: `20.118.48.17`.
- App Service default host: `app-airstrip-prod-centralus-001.azurewebsites.net`.
- App Service custom domain verification ID: `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.
- Active nameservers: `ns1.bluehost.com`, `ns2.bluehost.com`.
- `airstripclublasvegas.com` A record: `66.81.203.198`.
- `www.airstripclublasvegas.com` A record: `66.81.203.198`.
- `asuid.airstripclublasvegas.com`: not found.
- `asuid.www.airstripclublasvegas.com`: not found.

Required Bluehost owner-action DNS packet:

| Purpose | Type | Bluehost Host | Value |
| --- | --- | --- | --- |
| Root web traffic | A | `@` | `20.118.48.17` |
| Root Azure ownership verification | TXT | `asuid` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| WWW web traffic | CNAME | `www` | `app-airstrip-prod-centralus-001.azurewebsites.net` |
| WWW Azure ownership verification | TXT | `asuid.www` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

Because DNS did not point to the App Service and required ownership TXT records were absent, Azure hostname binding was not attempted.

No Bluehost mutation, nameserver change, Azure DNS zone creation, Google Workspace email DNS activation, CDN, or Front Door action occurred.

## Airstrip Production Status Update

Result: passed.

Exactly 5 Airstrip pages were updated through the source-supported tenant page API. Only `staticPublishing` deployment metadata was changed.

Status value:

`production_default_host_live_bluehost_dns_owner_action_required`

Each updated page remains:

- `tenantId`: `airstrip-club-las-vegas`
- `isPublished`: true
- `includeInSitemap`: true
- `staticPublishing.needsRebuild`: false

No Ice page was mutated.

## Runtime No Regression

Result: passed.

- Airstrip production default host key routes: HTTP 200.
- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Isolated Ice static contact health: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.

## Boundaries

No indexing, Search Console, URL inspection, sitemap indexing submission, contact POST, form submission, media upload/delete, Ice mutation, storage key/listKeys, SAS generation, connection string generation, Key Vault secret query, DNS registrar mutation, nameserver change, Azure DNS zone creation, Google Workspace email DNS activation, CDN/Front Door action, package source modification, normalized package staging, screenshot staging, `.tmp` staging, or `git add -A` occurred.

No secret values were printed or written to repo reports.
