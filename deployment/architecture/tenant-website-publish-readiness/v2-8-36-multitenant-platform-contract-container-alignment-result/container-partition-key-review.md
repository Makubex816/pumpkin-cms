# Container Partition Key Review

Source-confirmed partition behavior:

- `Page` writes and reads use `new PartitionKey(tenantId)` in key paths and source queries filter by `c.tenantId`.
- `MediaAsset` reads/writes use `new PartitionKey(tenantId)` and filter by `c.tenantId`.
- `PublishRun` reads/writes use `new PartitionKey(tenantId)` and filter by `c.tenantId`.
- `ImportRun` reads/writes use `new PartitionKey(tenantId)` and filter by `c.tenantId`.
- Models for `Page`, `MediaAsset`, `PublishRun`, and `ImportRun` expose `TenantId`.

Live result:

- `Page`, `MediaAsset`, `PublishRun`, and `ImportRun` were created with `/tenantId`.
- Existing `Tenant`, `User`, and `FormEntry` already used `/tenantId`.

Classification: partition key source confirmed and live aligned for active scope.
