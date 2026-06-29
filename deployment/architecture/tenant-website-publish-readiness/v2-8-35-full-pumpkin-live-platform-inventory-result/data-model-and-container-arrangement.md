# Data Model And Container Arrangement

Source data connection:

- `apps/pumpkin-api/Services/CosmosDataConnection.cs`.
- Source container names discovered from `GetContainer(...)` calls:
  - `FormEntry`
  - `ImportRun`
  - `MediaAsset`
  - `Page`
  - `PublishRun`
  - `Tenant`
  - `Theme`
  - `User`

Production Cosmos containers:

- Singular containers present: `FormEntry`, `Tenant`, `User`.
- Singular source containers not found in Azure inventory: `Page`, `MediaAsset`, `PublishRun`, `ImportRun`, `Theme`.
- Lower/plural containers present: `pages`, `mediaAssets`, `publishRuns`, `importRuns`, `themes`, plus `routes`, `sites`, `tenants`, `users`, `forms`.

Provider metadata source:

- `apps/pumpkin-api/Services/ProviderMetadataService.cs` advertises lower/plural future-target containers.
- It reports `ProviderStatus: future-target` and `RuntimeStatus: metadata-endpoint-runtime-wiring-required`.

Conclusion:

The contact/auth/key-rotation lane is live because it uses the singular containers that exist. The broader CMS lane needs a controlled source/data alignment decision before live validation. Either source must be updated to lower/plural containers with compatible models, or missing singular containers/data must be created/migrated. No mutation was performed in V2.8.35.
