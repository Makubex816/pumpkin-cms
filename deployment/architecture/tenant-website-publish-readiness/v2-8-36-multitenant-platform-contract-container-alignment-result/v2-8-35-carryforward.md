# V2.8.35 Carryforward

Carried forward:

- Contact gate: closed.
- Key rotation: closed_success.
- Pumpkin API health endpoints: live 200, with source-hardcoded `providerConfigured:false`.
- Media host: storage account `iceskatingmedia`, container `ice-rink-rentals-media`, prefix `ice-rink-rentals/assets/`.
- Cosmos production: account `cosmos-pumpkin-prod-eastus`, database `pumpkin-prod-cms`.
- Admin UI: source exists at `apps/admin`, but no deployed Admin UI resource was found.
- Backup/monitoring gaps: App Service backups not configured; diagnostics largely absent; media storage soft delete/versioning/change feed not enabled.
- Cleanup candidates remain untouched: empty East US and East US 2 Pumpkin API resource groups, and legacy static form endpoint resource group requiring dependency confirmation.

Prior proof traces retained as no-regression evidence:

- V2.8.33B production contact proof trace `v2-8-33b-production-static-contact-20260629015903-78f5b35b`.
- V2.8.34A isolated rotation proof trace `v2-8-34a-isolated-key-rotation-20260629134931-a88a0d37`.
- V2.8.34A production rotation proof trace `v2-8-34a-production-key-rotation-20260629134931-bf80dd04`.
