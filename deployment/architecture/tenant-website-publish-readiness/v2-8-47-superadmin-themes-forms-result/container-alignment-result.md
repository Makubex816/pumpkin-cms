# Container Alignment Result

Start-state live containers included:

- Source-aligned `/tenantId`: `Tenant`, `User`, `Page`, `FormEntry`, `ImportRun`, `PublishRun`, `MediaAsset`.
- Legacy/future `/tenantKey`: lowercase `tenants`, `users`, `pages`, `forms`, `themes`, `mediaAssets`, `routes`, `importRuns`, `publishRuns`, `sites`.

Repair action:

- Created source-required uppercase `Theme` container with partition key `/tenantId`.

Final state:

- `Theme` exists with `/tenantId`.
- `FormDefinition` was not created because no standalone FormDefinition storage path is source-confirmed.
- Legacy lowercase containers were not deleted or migrated.
