# Pumpkin Media Library Phase 6K Report

## Summary

Phase 6K adds a tenant-scoped Media Library / Asset Manager MVP for image metadata. The implementation registers and edits metadata for existing URLs only. It does not upload binary files, create production storage credentials, deploy to Azure, modify Cloudflare, hard delete assets, create provider/state research, or create production pages.

## Files Changed

- `apps/pumpkin-net-models/Models/MediaAsset.cs`
- `packages/pumpkin-ts-models/src/models/MediaAsset.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Services/MediaAssetSanitizer.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/admin/src/lib/api.ts`
- `apps/admin/src/app/dashboard/layout.tsx`
- `apps/admin/src/app/dashboard/media/page.tsx`
- `apps/admin/src/app/dashboard/media/[id]/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `deployment/static-azure/media-library-static-assets.md`
- `PUMPKIN_MEDIA_LIBRARY_PHASE6K_REPORT.md`

## Data Model

Added `MediaAsset` with:

- `id`, `tenantId`, `assetId`
- `url`, `fileName`, `title`, `alt`, `caption`
- `source`, `sourceUrl`
- `licenseStatus`
- `usageStatus`
- `width`, `height`, `mimeType`, `fileSize`
- `focalPoint.x`, `focalPoint.y`
- `decorative`
- `tags`, `notes`
- `createdAt`, `updatedAt`, `createdBy`, `lastReviewedAt`, `reviewedBy`
- `usageReferences[]`

Allowed license statuses:

```text
unknown, needs_review, approved, rejected, owned, licensed, ai_generated, partner_provided
```

Allowed usage statuses:

```text
unused, in_use, needs_review, approved_for_publish
```

## API Endpoints

Added authenticated, tenant-scoped admin endpoints:

- `GET /api/admin/{tenantId}/media-assets`
- `GET /api/admin/{tenantId}/media-assets/{id}`
- `POST /api/admin/{tenantId}/media-assets`
- `PATCH /api/admin/{tenantId}/media-assets/{id}`

The API stores metadata only. It rejects local config paths, `.env` references, `appsettings` references, `file:` URLs, `javascript:` URLs, data URLs, and URL strings containing markup.

No hard delete endpoint was added.

## Admin Routes

Added:

- `/dashboard/media`
- `/dashboard/media/[id]`

The admin navigation now includes `Media`.

The list view supports:

- tenant-scoped asset listing
- register existing URL
- thumbnail preview
- search
- license and usage filters
- missing-alt filter
- in-use filter
- warning count indicators

The detail/edit view supports:

- preview image
- copy URL
- editing title, alt, caption, source, source URL
- license/usage status
- dimensions, MIME type, file size
- focal point `x/y`
- decorative flag
- tags and notes
- usage references display
- warning panel

## Page Editor Integration

The existing page editor already exposes page-level media slots with `assetId`, URL, alt, source, license, usage, dimensions, focal point, and decorative fields.

Phase 6K adds inline guidance in the page editor Media section linking to `/dashboard/media`. The intended MVP workflow is:

1. Register an existing image URL in Media.
2. Copy the `assetId`, URL, and alt text into the relevant page media slot.
3. Save the page through the existing revision/rollback page update path.

A full media picker is deferred.

## Validation Warnings

Static validation now warns when a page-level media slot has a URL but no `assetId`, which means the image is not clearly tied to a Media Library record.

Existing warnings still cover missing alt text, source, license status, and usage status.

Warnings remain advisory; static builds are not blocked yet.

## Static Publishing Impact

Static export remains valid and URL-based. Media files are not copied, uploaded, resized, or hosted by this phase.

Production asset hosting/CDN workflow is documented as future work in:

```text
deployment/static-azure/media-library-static-assets.md
```

## Cosmos Setup Requirements

New local/production Cosmos container required:

```text
Container: MediaAsset
Partition key: /tenantId
```

For local runtime verification, the `MediaAsset` container was created in the Cosmos Emulator with partition key `/tenantId`.

## Runtime Verification

Completed:

- Restarted Pumpkin API with the Phase 6K code.
- Created local Cosmos Emulator container `MediaAsset` with partition key `/tenantId`.
- Registered one local Ice tenant test asset through the authenticated API.
- Updated the asset license status to `approved`, usage status to `approved_for_publish`, and focal point to `0.25 / 0.75`.
- Confirmed `GET /api/admin/ice-rink-rentals/media-assets` returned the Ice asset.
- Confirmed `GET /api/admin/ice-rink-rentals/media-assets/{id}` returned the updated asset detail.
- Confirmed `GET /api/admin/roller-rink-rentals/media-assets` returned a separate Roller tenant list with no Ice asset.
- Headless admin route verification loaded `/dashboard/media`.
- Ice tenant Media Library displayed `Phase 6K Test Asset`.
- Switching stored tenant context to Roller showed the empty-state and did not show the Ice asset.
- `/dashboard/media` route smoke check returned HTTP `200`.

The runtime verification used a short-lived local JWT generated from local API config without printing or committing the token or secret.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for Media routes, dashboard layout, and page editor - passed
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj` - passed
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` - passed after stopping the local API process that locked the DLL
- `npm run type-check` in `apps/ice-rink-web` - passed
- `npm run lint` in `apps/ice-rink-web` - passed
- `npm run build` in `apps/ice-rink-web` - passed
- `npm run validate:static:ice` in `apps/ice-rink-web` - passed with existing content-readiness warnings
- `npm run validate:static:roller` in `apps/ice-rink-web` - passed with existing content-readiness warnings
- `git diff --check` - passed with line-ending normalization warnings only
- protected config check for `.env.local` and `appsettings.Development.json` - no changes
- targeted high-confidence secret scan over changed files - passed

Package model note:

- `npm run build` in `packages/pumpkin-ts-models` could not find package-local `tsc`.
- Running the admin-installed `tsc` against `packages/pumpkin-ts-models` reported pre-existing `require` type errors in `src/PageJsonConverter.ts` because package-local `@types/node` is not installed/resolved in that context.
- To keep the ignored `dist/models` folder clean, only the tracked `dist/index.d.ts` type surface was updated with the `MediaAsset` declarations needed by app consumers.
- `apps/admin` type-check passed against the updated package type surface.

## Known Limitations

- No binary upload exists.
- No Azure Blob/Storage/CDN integration exists.
- No media hard delete or archive flow exists.
- No automatic image dimension extraction exists.
- No full page editor media picker exists yet.
- Usage references are stored/displayed, but automatic page-reference scanning is future work.
- MediaAsset import/export is documented as future work; page import/export already preserves page-level media and `assetId` fields.
- Static validation can warn about missing `assetId`, but it does not yet verify that the referenced `MediaAsset` record exists.

## Next Recommended Phase

Phase 6L should add either:

- a lightweight Media Picker for page media slots, or
- automatic media usage scanning/backfill that finds page image URLs, registers MediaAsset records, and writes `assetId` references through the safe revision path.
