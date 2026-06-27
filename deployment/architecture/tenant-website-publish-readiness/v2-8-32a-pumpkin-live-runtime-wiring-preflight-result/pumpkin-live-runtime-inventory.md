# Pumpkin Live Runtime Inventory

## Azure subscription

| Field | Value |
| --- | --- |
| Subscription | `Azure subscription 1` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Tenant id | `38b16667-a82c-4ff8-98d8-aeebbec4536a` |
| State | `Enabled` |

## Static Web Apps

| Resource | Resource group | Default hostname | Custom hostnames | Status |
| --- | --- | --- | --- | --- |
| `swa-ice-static-staging` | `rg-ice-static-staging` | `happy-mud-0b375e20f.7.azurestaticapps.net` | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` | Live production-bound SWA |
| `swa-ice-static-isolated-staging` | `rg-ice-static-staging` | `kind-island-0a85a740f.7.azurestaticapps.net` | none | Available isolated lane |

## Function Apps

| Resource | Resource group | Default hostname | State | Classification |
| --- | --- | --- | --- | --- |
| `func-ice-static-contact-20260605` | `rg-ice-static-form-endpoint` | `func-ice-static-contact-20260605.azurewebsites.net` | Running | Legacy/static contact Function App, not the Pumpkin API backend |

## Web Apps / App Service

| Resource | Evidence | Classification |
| --- | --- | --- |
| Pumpkin API Web App/App Service | `az webapp list` returned `[]` | Missing or not visible in active subscription metadata |
| `pumpkin-api-cdg2d3dwfpbbdygn.centralus-01.azurewebsites.net` | Repo-local publish-profile hint only | Candidate/stale until live metadata verifies it |

## Cosmos

| Resource | Resource group | Database | Containers |
| --- | --- | --- | --- |
| `cosmos-pumpkin-prod-eastus` | `rg-ice-production-cosmos` | `pumpkin-prod-cms` | `forms`, `importRuns`, `routes`, `mediaAssets`, `users`, `themes`, `pages`, `sites`, `tenants`, `publishRuns` |
| `cosmos-pumpkincms-stg-olm01` | `rg-pumpkincms-stg-eastus-olm` | `pumpkincms-olm-staging` | staging outbound-link containers |

## Storage and supporting resources

| Resource | Resource group | Classification |
| --- | --- | --- |
| `iceforms20260605` | `rg-ice-static-form-endpoint` | Static contact function storage |
| `iceskatingmedia` | `rg-ice-production-media` | Ice production media storage |
| `pumpkincmsstgolm01` | `rg-pumpkincms-stg-eastus-olm` | Staging PumpkinCMS storage |
| `id-pumpkincms-olm-stg` | `rg-pumpkincms-stg-eastus-olm` | Staging managed identity |
| `kv-pumpkincms-stg-olm01` | `rg-pumpkincms-stg-eastus-olm` | Staging Key Vault; no secrets queried |

## Source runtime

| Component | Source evidence | Runtime requirement |
| --- | --- | --- |
| Pumpkin API | `apps/pumpkin-api/Program.cs` exposes `POST /api/forms/{tenantId}/entries` and Admin form-entry routes | Needs live host and provider binding |
| Pumpkin API persistence | `DatabaseService` delegates `SaveFormEntryAsync` and `GetFormEntriesByTenantAsync` to configured provider | Needs live provider config for production Cosmos |
| Admin | `apps/admin/src/lib/api.ts` uses `NEXT_PUBLIC_API_URL` with localhost fallback | Needs live Admin environment binding to Pumpkin API |
| Public Ice Next API contact route | `apps/ice-rink-web/src/app/api/contact/route.ts` forwards to `${PUMPKIN_API_URL}/api/forms/{tenantId}/entries` | Not the current static production path, but confirms app-route design |
| Static contact compat | `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs` supports `FORM_DELIVERY_MODE=pumpkin-api` | Needs live app setting names and protected values bound in Azure |
