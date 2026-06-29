# V2.8.35 Full Pumpkin Live Platform Inventory Report

Phase status: complete.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `full_live_platform_inventory_admin_ui_status_backup_monitoring_gap_audit_no_deploy_no_mutation`.

## V2.8.34B Carryforward

- Contact gate status: closed.
- Key rotation status: closed_success.
- V2.8.33B production trace: `v2-8-33b-production-static-contact-20260629015903-78f5b35b`.
- V2.8.33B production entry ID: `ice-rink-rentals-default-quote-request-97389127-25ea-4731-8bbe-62f6c59e88b4`.
- V2.8.34A isolated trace: `v2-8-34a-isolated-key-rotation-20260629134931-a88a0d37`.
- V2.8.34A isolated entry ID: `ice-rink-rentals-default-quote-request-64735477-8f5b-41bb-846c-e6f8078b057e`.
- V2.8.34A production trace: `v2-8-34a-production-key-rotation-20260629134931-bf80dd04`.
- V2.8.34A production entry ID: `ice-rink-rentals-default-quote-request-1fb21846-365d-4478-96e7-1e76cae92747`.

## Subscription Lock

- Active subscription: `Azure subscription 1`.
- Subscription ID: `ff887def-fd83-4a19-9298-13d4b1687873`.
- Operator user: `Contact@iceskatingrinkrentals.com`.
- Azure inspection proceeded only after the approved subscription was active.

## High-Level Inventory

Live production resources:

- Public static site SWA: `swa-ice-static-staging` in `rg-ice-static-staging`.
- Isolated proof SWA: `swa-ice-static-isolated-staging` in `rg-ice-static-staging`.
- Pumpkin API App Service: `app-pumpkin-api-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`.
- Pumpkin API plan: `asp-pumpkin-api-prod-centralus-001`, Basic B1.
- Cosmos account: `cosmos-pumpkin-prod-eastus` in `rg-ice-production-cosmos`.
- Media storage: `iceskatingmedia` in `rg-ice-production-media`.

Nonproduction or cleanup-review resources:

- Empty fallback groups: `rg-pumpkin-api-prod-eastus`, `rg-pumpkin-api-prod-eastus2`.
- Legacy/static-form function stack: `rg-ice-static-form-endpoint`.
- Outbound Link Manager staging lane: `rg-pumpkincms-stg-eastus-olm`.
- Default workspace group: `DefaultResourceGroup-EUS`.

## Live/Local Boundary

- Public Ice contact path is live and backed by the current static contact bridge.
- Pumpkin API health endpoints are live, but `providerConfigured:false` is hardcoded in the dependency-light health response and is not a live provider test.
- Admin UI is source-present and type-checks locally, but no deployed Admin UI Azure resource was found.
- Broader CMS production readiness is blocked by the current source/container naming mismatch for pages, media, themes, publish runs, and import runs.

## Media Answer

Public website media files are hosted in Azure Blob Storage:

- Storage account: `iceskatingmedia`.
- Resource group: `rg-ice-production-media`.
- Container: `ice-rink-rentals-media`.
- Public base: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`.
- Live prefix: `ice-rink-rentals/assets/`.
- Blob inventory found 9 PNG assets under the live prefix.
- Source media map: `apps/ice-rink-web/src/data/ice-rink-media.ts`.

## Database Answer

Live production database:

- Cosmos account: `cosmos-pumpkin-prod-eastus`.
- Resource group: `rg-ice-production-cosmos`.
- Database: `pumpkin-prod-cms`.
- Backup policy: Continuous, 30-day tier.

Live containers found:

- `FormEntry`, `Tenant`, `User`
- `forms`, `importRuns`, `mediaAssets`, `pages`, `publishRuns`, `routes`, `sites`, `tenants`, `themes`, `users`

Important gap:

- Current `CosmosDataConnection` source uses singular model containers: `FormEntry`, `ImportRun`, `MediaAsset`, `Page`, `PublishRun`, `Tenant`, `Theme`, `User`.
- Production Cosmos has the singular containers needed for the proven contact/auth/key-rotation lane, but the broader CMS singular containers `Page`, `MediaAsset`, `PublishRun`, `ImportRun`, and `Theme` were not present in the Azure container inventory.
- Provider metadata source advertises the lower/plural future-target containers. This needs a controlled alignment decision before broader CMS live validation.

## Admin UI Status

Admin UI classification: `local_only_not_live_deployed`.

- Source app: `apps/admin`.
- Type-check: passed with `npm --prefix apps/admin run type-check`.
- API binding variable: `NEXT_PUBLIC_API_URL`.
- Current fallback API target in source: `http://localhost:5064`.
- Azure inventory found no Admin UI SWA, Web App, or clear admin-host resource.
- Recommended deployment target for next approval: dedicated Admin UI Static Web App `swa-pumpkin-admin-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`, bound to `NEXT_PUBLIC_API_URL=https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`.

Admin API current login proof was not re-run because the approved owner hard-copy hash matched, but the password field could not be extracted by the bounded in-memory parser. No credentials were printed, and no login POST was attempted.

## Backup And Monitoring

- Cosmos production backup posture: strongest current area, Continuous 30-day backup configured.
- App Service backup posture: no backup items configured for `app-pumpkin-api-prod-centralus-001`.
- App Service logging: filesystem application logs at Error; HTTP logs, detailed errors, and failed request tracing are off.
- Diagnostic settings: none attached to the core API, SWA, Cosmos, or media storage resources inspected.
- Media storage redundancy: `Standard_LRS`; blob soft delete off; versioning/change feed/point-in-time restore not enabled.
- Static Web Apps: no diagnostic settings found.
- Staging OLM lane has App Insights and Log Analytics, but those are not production Pumpkin API monitoring.

## CMS Readiness Summary

- Contact capture: proven live.
- Static contact bridge: proven live after key rotation.
- Admin UI: proven local, not deployed.
- Admin API auth/readback: previously proven during V2.8.34A; not revalidated in V2.8.35.
- Tenant/key rotation lane: proven live for contact authentication record.
- Page editor, media management, publish/import runs, theme management: source-present but blocked for production validation until container naming and Admin UI deployment/binding are resolved.
- Backup tooling/resource registry lanes: source and prior packages exist, but production operational backup/monitoring needs hardening.

## Cleanup Candidates

- `rg-pumpkin-api-prod-eastus`: empty fallback group, cleanup candidate after final confirmation.
- `rg-pumpkin-api-prod-eastus2`: empty fallback group, cleanup candidate after final confirmation.
- `rg-ice-static-form-endpoint`: legacy/static-form Function App stack still running; cleanup requires traffic and dependency confirmation before decommission.
- `rg-pumpkincms-stg-eastus-olm`: active nonproduction staging lane, do not delete.
- `DefaultResourceGroup-EUS`: shared/default Log Analytics workspace group, do not delete without owner confirmation.

## Next Priorities

1. Run a controlled V2.8.36 preflight to reconcile live Cosmos container naming against source before any broader CMS write validation.
2. Deploy Admin UI only after the container alignment decision and API auth proof are clean.
3. Add production diagnostics/monitoring and backup hardening for App Service, SWA, media storage, and alerting.
4. Prepare a cleanup approval for empty fallback groups and the legacy function stack, with no deletion until separately approved.

## Files

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_35_FULL_PUMPKIN_LIVE_PLATFORM_INVENTORY_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-35-full-pumpkin-live-platform-inventory-result/`

## Validation

Validation status: passed.

Details are recorded in `deployment/architecture/tenant-website-publish-readiness/v2-8-35-full-pumpkin-live-platform-inventory-result/validation-summary.md`.

## Commit Instructions

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_35_FULL_PUMPKIN_LIVE_PLATFORM_INVENTORY_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-35-full-pumpkin-live-platform-inventory-result/"
git commit -m "docs: inventory live pumpkin platform"
```
