# Resource Map Update

Observability:

- RG: `rg-pumpkin-observability-prod-centralus`
- Log Analytics: `law-pumpkin-prod-centralus-001`
- Action group: `ag-pumpkin-prod-ops-email-001`

Monitored resources:

- App Service: `app-pumpkin-api-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`
- App Service: `app-pumpkin-admin-isolated-centralus-001` in `rg-pumpkin-api-prod-centralus`
- App Service: `app-pumpkin-admin-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`
- Cosmos DB: `cosmos-pumpkin-prod-eastus` in `rg-ice-production-cosmos`
- Storage account: `iceskatingmedia` in `rg-ice-production-media`
- Blob service: `iceskatingmedia/blobServices/default` in `rg-ice-production-media`
- Static Web App: `swa-ice-static-staging` in `rg-ice-static-staging`
- Static Web App: `swa-ice-static-isolated-staging` in `rg-ice-static-staging`

Storage protection:

- Media account: `iceskatingmedia`
- Container: `ice-rink-rentals-media`
- Prefix: `ice-rink-rentals/assets/`
