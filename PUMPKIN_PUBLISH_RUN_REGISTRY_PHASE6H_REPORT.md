# Pumpkin Publish Run Registry Phase 6H Report

## Summary

Phase 6H adds a tenant-scoped Publish Run Registry / Build History foundation for static-first publishing.

The new registry records dry-run/build metadata only. It does not upload to Azure, purge Cloudflare, run shell commands from the browser, mark pages deployed, clear rebuild flags, create production pages, or create provider/state research files.

## Files Changed

- `apps/pumpkin-net-models/Models/PublishRun.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Services/PublishRunSanitizer.cs`
- `apps/pumpkin-api/Program.cs`
- `packages/pumpkin-ts-models/src/models/PublishRun.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts.map`
- `packages/pumpkin-ts-models/dist/index.js.map`
- `apps/admin/src/lib/api.ts`
- `apps/admin/src/app/dashboard/publishing/action-center/page.tsx`
- `apps/admin/src/app/dashboard/publishing/page.tsx`
- `deployment/static-azure/README.md`
- `deployment/static-azure/publish-action-center.md`
- `deployment/static-azure/publish-run-registry.md`
- `PUMPKIN_PUBLISH_RUN_REGISTRY_PHASE6H_REPORT.md`

## Data Model

New model:

```text
PublishRun
```

Important fields:

- `id`
- `tenantId`
- `siteKey`
- `domain`
- `runId`
- `source`
- `runType`
- `status`
- `releaseFolder`
- `manifestPath`
- `summaryPath`
- `createdAt`
- `importedAt`
- `createdBy`
- `notes`
- `sites`
- `pageCount`
- `fileCount`
- `redirectCount`
- `pageQualityWarningCount`
- `contentWarningCount`
- `readyForManualUpload`
- `errors`
- `warnings`
- `manifestSummary`
- `deploymentTarget`
- `deployedAt`
- `deploymentStatus`

The model includes per-site summary records so a dry-run manifest that packages both Ice and Roller can still be represented safely.

## API Endpoints Added

```text
GET  /api/admin/{tenantId}/publish-runs
GET  /api/admin/{tenantId}/publish-runs/{id}
POST /api/admin/{tenantId}/publish-runs
```

All endpoints:

- require JWT admin authentication
- enforce tenant scope
- do not accept or expose tenant API keys
- do not run shell commands
- do not deploy or purge anything

`POST` saves sanitized metadata and upserts by tenant/run ID.

## Admin UI Behavior

The Publish Action Center now supports:

- existing local browser history
- `Save To CMS History`
- CMS history success/error feedback
- tenant-scoped CMS Publish Run History table
- refresh action for CMS history
- per-run status, content source, file count, redirect count, warning count, imported time, and deployment status

The Publishing Dashboard now shows the latest CMS publish run summary for the selected tenant with a link back to the Action Center.

## Manifest Sanitization

Before storage:

- local absolute paths are stripped
- `.env` and `appsettings` path references are stripped
- tenant/site mismatch is rejected
- `source`, `runType`, `status`, `deploymentTarget`, and `deploymentStatus` are constrained to safe values
- top-level counts are derived from the matching tenant site summary
- only summary metadata is stored, not full static output

## Tenant Safety

Saving a manifest requires at least one site entry matching the selected tenant/site key.

If a manifest includes both Ice and Roller, the current tenant's matching site drives the top-level counts/status. The cross-site entries remain as safe site summaries for context.

The API never silently saves a manifest under the wrong tenant.

## Local History vs CMS History

Local browser history:

- stays in `localStorage`
- is convenient but not authoritative
- remains available for quick operator review

CMS history:

- is persisted through Pumpkin API
- is tenant-scoped
- can be shared across browsers/admin sessions
- is the foundation for future build/deploy history

## Publishing Dashboard Integration

The Publishing Dashboard now reads publish-run history and shows:

- latest run ID
- latest status
- file count
- warning count
- redirect count
- imported timestamp
- content source
- deployment status

This is read-only visibility. It does not clear rebuild flags or mark deployment complete.

## Cosmos Setup Requirements

New Cosmos container required:

```text
Container: PublishRun
Partition key: /tenantId
```

If the `PublishRun` container is missing, existing page editing, import/export, runtime CMS mode, and static export continue to work. Publish-run history list/save calls will fail until the container exists.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for Action Center, Publishing Dashboard, admin API client, and publishing-readiness helper - passed
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj` - passed after stopping the locked local Pumpkin API process
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` - passed after stopping the locked local Pumpkin API process
- `packages/pumpkin-ts-models` TypeScript emit was attempted using the admin TypeScript compiler; dist files emitted, but pre-existing missing Node `require` type errors remain in `PageJsonConverter.ts`
- Pumpkin API was restarted locally after build verification; root endpoint returned HTTP `200`
- unauthenticated `GET /api/admin/ice-rink-rentals/publish-runs` returned HTTP `401`
- admin `/dashboard/publishing` returned HTTP `200`
- admin `/dashboard/publishing/action-center` returned HTTP `200`
- temporary local Pumpkin API verification process was stopped after checks to avoid DLL locks
- `git diff --check` - passed with line-ending normalization warnings only
- targeted high-confidence secret scan over changed/untracked files - passed
- protected config check for `.env.local` and `appsettings.Development.json` - no changes
- `.github/workflows` diff check - no changes

## Runtime Verification

Completed local runtime checks:

- Pumpkin API restarted successfully after build verification.
- API root endpoint returned HTTP `200`.
- Unauthenticated publish-run history request returned HTTP `401`, confirming JWT protection is active.
- Admin Publishing Dashboard route returned HTTP `200`.
- Admin Publish Action Center route returned HTTP `200`.

Completed manual browser/runtime verification:

- Local Cosmos Emulator container `PublishRun` was created with partition key `/tenantId`.
- Pumpkin API restarted successfully.
- Admin login worked.
- Publish Action Center loaded.
- Dry-run manifest `2026-05-19-1616` was pasted and parsed.
- Save To CMS History succeeded.
- CMS Publish Run History displayed the saved run.
- Publishing Dashboard displayed the latest CMS Publish Run summary.
- Latest run showed runId `2026-05-19-1616`, contentSource `cms-snapshot`, status `completed with warnings`, and deployment status `not_deployed`.
- Selected tenant dashboard showed file count `42`, redirects `0`, and warning count `112`.
- Tenant-scoped publish history behavior was confirmed.
- No shell commands ran from the browser.
- No Azure deployment or Cloudflare purge occurred.
- No `.env.local` or `appsettings.Development.json` changes were made.

## Known Limitations

- No database-backed publish-run detail page was added yet.
- No deployment status update endpoint was added in this phase.
- The API requires the `PublishRun` Cosmos container to exist.
- Saving a publish run does not clear `staticPublishing.needsRebuild`.
- Saving a publish run does not set `lastDeployedAt`.
- Local browser history remains separate from CMS history.

## Next Recommended Phase

Phase 6I should either add a read-only publish-run detail page with manifest/site details or move into Azure Static Web Apps staging execution using the existing runbooks.
