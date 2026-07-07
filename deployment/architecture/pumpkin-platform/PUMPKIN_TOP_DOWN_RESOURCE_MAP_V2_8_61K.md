# Pumpkin Top-Down Resource Map V2.8.61K

Status: completed.

## Owner View

The Pumpkin platform is one live Azure subscription with:

- one live API;
- one live standalone Admin UI;
- one live Ice public website;
- one production Cosmos database account;
- one production media storage account;
- one production monitoring stack;
- one Airstrip production default-host app and one Airstrip isolated preview app;
- a local starter app source baseline that is not deployed.

## Live Production

Pumpkin API:

- `app-pumpkin-api-prod-centralus-001`
- Hosts production API routes for tenants, pages, media, forms, Admin UI integrations, DomainBinding, import runs, and publish runs.

Admin UI:

- `app-pumpkin-admin-prod-centralus-001`
- The platform/SuperAdmin control plane.

Ice website:

- `swa-ice-static-staging`
- Public domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.

Data:

- `cosmos-pumpkin-prod-eastus`
- Database: `pumpkin-prod-cms`.

Media:

- `iceskatingmedia`
- Containers: `ice-rink-rentals-media`, `airstrip-club-las-vegas-media`.

Monitoring:

- `law-pumpkin-prod-centralus-001`
- `ag-pumpkin-prod-ops-email-001`
- six enabled metric alerts.

## Airstrip

Airstrip has live Azure resources but remains frozen in V2.8.61K:

- `app-airstrip-prod-centralus-001`
- `app-airstrip-preview-isolated-centralus-001`
- `airstrip-club-las-vegas-media`

Airstrip custom-domain work remains pending:

- owner DNS action is still required;
- Azure custom-domain binding is not attempted;
- managed TLS is not attempted;
- V2.8.61K did not probe Airstrip routes.

## Starter

`apps/starter-app` is source-only and local-proofed. It is not an Azure resource. Its embedded `/admin` is tenant-local only and does not replace the standalone Admin UI.

## Do-Not-Delete Rule

Do not delete any production, isolated, monitoring, Cosmos, media, Airstrip, or legacy/deferred resource until a later approved cleanup or replacement phase proves it is safe.
