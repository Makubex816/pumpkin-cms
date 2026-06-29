# MediaAsset Cleanup Route Repair Result

Result: source repair implemented, live activation blocked by deployment failure.

Implemented behavior:

- Route: `DELETE /api/admin/{tenantId}/media-assets/{id}`.
- Auth: JWT required.
- Tenant scope: route tenant must match caller tenant unless SuperAdmin.
- Data operation: resolves the MediaAsset by tenant-scoped id/assetId read, then deletes by resolved id and tenant partition.
- Blob behavior: metadata-only; no blob delete is performed by the route.

Cosmos behavior:

- Reads with `GetMediaAssetAsync(tenantId, id)`.
- Deletes with the resolved MediaAsset id and `PartitionKey(tenantId)`.
- Returns false for not found.

Mongo behavior:

- Reads with tenant-scoped id/assetId filter.
- Deletes only the resolved id in the same tenant.

Live result:

Not proven live because Pumpkin API deployment failed.
