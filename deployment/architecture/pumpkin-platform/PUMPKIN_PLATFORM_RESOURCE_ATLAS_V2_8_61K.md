# Pumpkin Platform Resource Atlas V2.8.61K

Status: completed.

This is the durable, repo-safe resource atlas for the post-integration Pumpkin platform state. It contains no raw secrets.

## Scope

The atlas covers:

- Azure subscription and resource groups.
- Production core resources.
- Isolated/staging/proof resources.
- App Services and Static Web Apps.
- Cosmos databases and containers.
- Storage accounts and blob containers.
- Pumpkin API and Admin UI bindings.
- Ice and Airstrip tenant bindings.
- DomainBinding and custom-domain state.
- Backup, restore, package intake, compiler, and operator proof locations.
- Observability resources.
- Starter app local/proof state.
- Do-not-delete and cleanup candidate registers.

## Top-Level Counts

| metric | value |
| --- | ---: |
| Accessible subscriptions | 1 |
| Resource groups | 8 |
| Azure resources | 29 |
| App Services | 6 |
| Static Web Apps | 2 |
| App Service plans | 2 |
| Cosmos accounts | 2 |
| Storage accounts | 3 |
| Log Analytics workspaces | 3 |
| Action groups | 2 |
| Metric alerts | 6 |
| Key Vaults | 1 |
| Managed identities | 1 |
| Application Insights components | 1 |

## Resource Groups

| resourceGroup | region | purpose | status |
| --- | --- | --- | --- |
| rg-pumpkin-api-prod-centralus | centralus | API, Admin UI, Airstrip App Services, shared App Service plan | active |
| rg-ice-static-staging | eastus2 | Ice production and isolated Static Web Apps | active |
| rg-ice-production-cosmos | eastus | production Cosmos | active |
| rg-ice-production-media | eastus | production media storage | active |
| rg-pumpkin-observability-prod-centralus | centralus | production monitoring and alerts | active |
| rg-ice-static-form-endpoint | eastus | legacy static contact resources | legacy_deferred |
| rg-pumpkincms-stg-eastus-olm | eastus | older staging/outbound-link-manager resources | cleanup_candidate_needs_dependency_proof |
| DefaultResourceGroup-EUS | eastus | default workspace outside current Pumpkin live scope | outside_current_scope |

## Active Production Core

- `app-pumpkin-api-prod-centralus-001`: production Pumpkin API App Service.
- `app-pumpkin-admin-prod-centralus-001`: production standalone Admin UI App Service.
- `asp-pumpkin-api-prod-centralus-001`: shared Basic B1 App Service plan.
- `swa-ice-static-staging`: Ice production Static Web App with apex and www custom domains.
- `cosmos-pumpkin-prod-eastus`: production Cosmos account, Continuous backup.
- `iceskatingmedia`: production media storage account with Ice and Airstrip containers.
- `law-pumpkin-prod-centralus-001`, `ag-pumpkin-prod-ops-email-001`, and six metric alerts: production observability.

## Tenants

Ice:

- Tenant key: `ice-rink-rentals`.
- Public domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- Web resource: `swa-ice-static-staging`.
- Media container: `ice-rink-rentals-media`.
- Data account/database: `cosmos-pumpkin-prod-eastus` / `pumpkin-prod-cms`.
- Status: live.

Airstrip:

- Tenant key: `airstrip-club-las-vegas`.
- Production default host resource: `app-airstrip-prod-centralus-001`.
- Isolated preview resource: `app-airstrip-preview-isolated-centralus-001`.
- Media container: `airstrip-club-las-vegas-media`.
- Data account/database: `cosmos-pumpkin-prod-eastus` / `pumpkin-prod-cms`.
- Custom domains: pending owner DNS and future Azure binding.
- Status: frozen in V2.8.61K.

Starter app:

- Source path: `apps/starter-app`.
- State: local-only, not deployed.
- `/admin` boundary: tenant-local only.
- Platform/SuperAdmin control plane remains `apps/admin`.

## Data And Storage

Production Cosmos database `pumpkin-prod-cms` contains current and compatibility containers for pages, themes, tenants, users, forms, form entries, media assets, DomainBinding, import runs, and publish runs.

Production storage account `iceskatingmedia` contains:

- `ice-rink-rentals-media`;
- `airstrip-club-las-vegas-media`.

The production media storage protection state is:

- blob soft delete enabled;
- container soft delete enabled;
- blob versioning enabled;
- change feed enabled.

## Observability

Production observability includes:

- `law-pumpkin-prod-centralus-001`;
- `ag-pumpkin-prod-ops-email-001`;
- six enabled metric alerts covering API, Admin UI, isolated Admin UI, Cosmos, media storage, and Ice SWA function errors.

## Legacy And Cleanup Candidates

Legacy static contact resources in `rg-ice-static-form-endpoint` and older outbound-link-manager resources in `rg-pumpkincms-stg-eastus-olm` are protected until a future dependency-proof cleanup phase is approved.

## Security Boundary

V2.8.61K performed read-only Azure metadata collection and GET-only non-Airstrip runtime proof. It did not mutate resources, deploy, read secret values, list keys, generate SAS, change DNS, submit forms, send contact POSTs, mutate media, mutate records, or probe Airstrip routes.
