# V2.8.45 Carryforward

V2.8.45 completed approved operational hardening:

- Observability resource group, Log Analytics workspace, and email action group created or confirmed.
- Diagnostics configured for three App Services, Cosmos DB, media storage account/blob service, and two Static Web Apps.
- Media storage blob soft delete, container soft delete, blob versioning, and change feed enabled.
- Cosmos Continuous30Days backup confirmed.
- App Service platform snapshots confirmed; custom backups deferred due no-SAS/no-key policy.
- Six low-noise metric alerts created.

The V2.8.45 blocker was GET-only runtime no-regression failure:

- Apex `/api/static-contact-health`: HTTP 500.
- Www `/api/static-contact-health`: HTTP 500.

V2.8.45 did not perform app deploys, contact POSTs, content writes, DNS/indexing, protected config reads, Key Vault reads, storage keys/listKeys, SAS generation, or connection string generation.

