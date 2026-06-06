# Staging Target Options

Generated: 2026-06-06

## Option A: Azure Static Web Apps Staging

Selected by user.

| Category | Details |
| --- | --- |
| resources required | `rg-pumpkin-static-staging`, `swa-ice-rink-rentals-staging` |
| region | `eastus` recommended from existing Ice Azure resources unless deployment approval chooses another region |
| deployment method | prebuilt static artifact deploy through SWA CLI or inactive GitHub Actions template activated later |
| artifact root | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` |
| app settings/secrets | deployment token placeholder only; no Pumpkin API key in static app |
| public static form value | already built with `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| custom domain needs | none for first default-host validation |
| later custom domain | optional `ice-dev.iceskatingrinkrentals.com` or `staging.iceskatingrinkrentals.com`, requiring separate DNS/Cloudflare approval |
| rollback path | redeploy prior known-good artifact or stop sharing default host |
| smoke tests | default hostname routes, media, form UI, safe endpoint OPTIONS, sitemap/robots, canonical/meta, noindex, 404 |
| approval required | yes, resource creation and deployment are not approved in this preflight |

Pros:

- Matches the repo's recommended staging-first path.
- Clean isolation from production domain and Roller.
- Managed HTTPS on Azure default hostname.
- Good fit for prebuilt static output.
- Supports future deployment history/rollback workflows.

Cons:

- No staging SWA currently exists, so resource creation is required later.
- Browser form submission from the Azure default hostname may need the Function allowed-origin list updated after the default hostname is known. That is a separate Function setting approval.
- Custom staging domain requires separate DNS/Cloudflare approval.

## Option B: Azure Storage Static Website Staging

Fallback only.

| Category | Details |
| --- | --- |
| resources required | new storage account and `$web` static website hosting, or a clearly approved existing staging storage target |
| deployment method | upload validated artifact contents to `$web` |
| artifact root | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` |
| app settings/secrets | storage auth handled outside repo; no connection strings in docs |
| custom domain needs | likely Cloudflare/CDN/Front Door for HTTPS |
| rollback path | re-upload previous known-good artifact to `$web` |
| smoke tests | storage endpoint route checks plus HTTPS/fronting checks |
| approval required | yes, storage resource creation/upload and any HTTPS fronting require explicit approval |

Pros:

- Simple static file host.
- Good fallback if SWA upload flow is blocked.

Cons:

- Custom-domain HTTPS is less direct.
- More Cloudflare/CDN/fronting planning needed.
- No existing suitable staging storage target was discovered.
- Less aligned with the repo's selected SWA-first staging path.

## Option C: Local Validated Package Only

Hold position.

| Category | Details |
| --- | --- |
| resources required | none |
| deployment method | none |
| artifact root | local artifact remains available but generated output is not staged |
| app settings/secrets | none beyond local validation shell |
| custom domain needs | none |
| rollback path | regenerate from CMS snapshot/export |
| smoke tests | local validators only; no Azure-hosted smoke test |
| approval required | no deployment approval needed because no deployment happens |

Pros:

- Zero infrastructure risk.
- Keeps Roller paused and avoids DNS/Cloudflare changes.
- Current package is already strictly validated.

Cons:

- Does not prove Azure hosting behavior.
- Azure staging readiness remains `no`.
- Cannot test SWA headers/default-host behavior.

## Decision

Option A is the chosen path for the next explicit deployment approval: create/use `swa-ice-rink-rentals-staging` and deploy the prebuilt Ice artifact to the Azure default hostname first.

Until that approval is granted, the current state remains preflight complete with no Azure resource creation or deployment performed.
