# MediaAsset Source Lifecycle Analysis

Pre-repair source state:

- MediaAsset list, read, create, upload, update, archive, restore, and replace routes existed.
- No hard cleanup/delete route existed.
- The archive route text stated hard delete was intentionally not exposed.

Source repair:

- Added `DELETE /api/admin/{tenantId}/media-assets/{id}`.
- The route requires authenticated Admin JWT.
- The route reads the `tenantId` claim and role claim.
- The route forbids cross-tenant deletion unless the caller is SuperAdmin.
- The route calls `DeleteMediaAssetAsync(tenantId, id)`.
- The endpoint deletes only MediaAsset metadata; it does not delete blobs.

Files changed:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/pumpkin-api.Tests/MediaAssetLifecycleCleanupTestRunner.cs`
