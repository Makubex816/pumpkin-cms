# MediaAsset Source Analysis

Source-discovered readiness:

- `apps/pumpkin-api/Program.cs:1578` maps Admin MediaAsset list.
- `apps/pumpkin-api/Program.cs:1610` maps Admin MediaAsset read.
- `apps/pumpkin-api/Program.cs:1642` maps metadata registration.
- `apps/pumpkin-api/Program.cs:1684` maps binary media upload.
- `apps/pumpkin-api/Program.cs:1808` maps metadata update.
- `apps/pumpkin-api/Program.cs:1862` maps archive.
- `apps/pumpkin-api/Program.cs:1906` maps restore.
- `apps/pumpkin-api/Program.cs:1950` maps replace.
- `apps/pumpkin-api/Services/MediaStorageService.cs:186` resolves media storage provider.
- `apps/pumpkin-api/Services/MediaStorageService.cs:187` resolves media storage container.
- `apps/pumpkin-api/Services/MediaStorageService.cs:197` currently throws for `azure-blob` provider in the API upload path.
- `apps/pumpkin-api/Services/MediaAssetSanitizer.cs` sanitizes create/update payloads and allows `azure-blob` as a storage provider value.

Important source boundary:

- No hard delete route for MediaAsset was found.
- The archive route description says hard delete is intentionally not exposed.
- Because no hard cleanup route exists, V2.8.41 did not create a live synthetic MediaAsset record.
