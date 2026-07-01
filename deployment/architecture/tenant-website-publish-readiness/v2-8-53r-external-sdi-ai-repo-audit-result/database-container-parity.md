# Database Container Parity

Classification: `source_container_compatibility_required_provider_metadata_mismatch_risk`

External source containers:

- `Tenant`
- `Page`
- `User`
- `Theme`
- `FormEntry`

Current source containers:

- `Tenant`
- `Page`
- `User`
- `Theme`
- `FormEntry`
- `FormDefinition`
- `MediaAsset`
- `PublishRun`
- `ImportRun`

Compatibility result:

- Current data access is additive over the external source container set.
- Tenant partitioning remains `tenantId`.
- Database settings shape remains `Database.Provider` with `CosmosDb` and `MongoDb` subsections.

Risk:

`ProviderMetadataService` reports future-target lower-case plural container names, while source data access uses singular Pascal-style names. This must be reconciled before using provider metadata as an authoritative live creation/restore map.
