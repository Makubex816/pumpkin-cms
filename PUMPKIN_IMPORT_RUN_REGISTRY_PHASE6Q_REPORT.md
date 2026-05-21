# Pumpkin Import Run Registry - Phase 6Q Report

## Summary

Phase 6Q adds a tenant-scoped ImportRun registry for durable import dry-run/import result audit history. It records sanitized metadata and summaries only; it does not execute imports, deploy to Azure, purge Cloudflare, or create any provider/state research artifacts.

## Files Changed

- `packages/pumpkin-ts-models/src/models/ImportRun.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `apps/pumpkin-net-models/Models/ImportRun.cs`
- `apps/pumpkin-api/Services/ImportRunSanitizer.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/admin/src/lib/api.ts`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-runs/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-runs/[id]/page.tsx`
- `deployment/static-azure/import-run-registry.md`
- `PUMPKIN_IMPORT_RUN_REGISTRY_PHASE6Q_REPORT.md`

## Data Model

Added `ImportRun` with:

- tenant-scoped identity: `id`, `tenantId`, `importRunId`
- source metadata: source, source label, staged package id/name, file name
- import mode/status
- created/completed timestamps and actor
- page/create/update/skip/conflict/error/warning/revision/rebuild counts
- affected page summaries
- validation summary
- diff summary
- import result summary
- preflight acknowledgement flags
- safe report summary
- `protectedConfigChanged` and `deploymentTriggered` safety fields

## Cosmos Setup

New container required:

- Container: `ImportRun`
- Partition key: `/tenantId`

The API returns setup-oriented errors if the container is missing. No production container creation was attempted.

## API Endpoints

Added authenticated, tenant-scoped admin endpoints:

- `GET /api/admin/{tenantId}/import-runs`
- `GET /api/admin/{tenantId}/import-runs/{id}`
- `POST /api/admin/{tenantId}/import-runs`

The POST endpoint stores sanitized audit metadata only. It does not execute imports or deployments.

## Import/Export Integration

Import/Export now offers:

- `View Import History`
- `Save Dry-Run Report To History`
- `Save Import Result To History`
- saved ImportRun confirmation with link to detail

The save action uses the current validation, diff, preflight, staged package, and import result summaries already present in the UI. It does not rerun import.

## UI Routes

Added:

- `/dashboard/pages/import-runs`
- `/dashboard/pages/import-runs/[id]`

The list shows date, source, mode, status, counts, revisions, and View action. The detail page shows metadata, validation/diff/result summaries, acknowledgement flags, affected pages, and safety notes.

## Sanitization

The API sanitizer:

- enforces route `tenantId`
- normalizes source/mode/status/action enums
- limits text lengths and affected page/message counts
- strips protected config-like file names
- forces `deploymentTriggered` to false
- stores summaries rather than raw imported page content

## Staged Package And Preflight Integration

If Import/Export is loaded from Content Package Staging, the ImportRun records:

- source `staged_package`
- source package id/name
- source label
- package-aware import run id

Preflight acknowledgement flags are recorded for published-page updates, slug changes, and warning-heavy packages.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin ESLint for Import/Export and ImportRun UI routes - passed
- `dotnet build` in `apps/pumpkin-net-models` - passed
- `dotnet build pumpkin-api.csproj` in `apps/pumpkin-api` - passed
- `dotnet build` in `apps/pumpkin-api` solution - passed after updating the test wrapper for current `IDatabaseService` members
- `git diff --check` - passed; Git reported expected LF-to-CRLF working copy normalization warnings for touched files only
- protected config check for `.env.local` and `appsettings.Development.json` - passed with no changes reported
- targeted secret scan - passed with no literal secret matches; a broader first pass only found existing variable-name references such as `apiKey`

## Runtime Verification

- Created local Cosmos Emulator container `ImportRun` with partition key `/tenantId` using a temporary helper outside the repo.
- Restarted Pumpkin API on `http://localhost:5064` after stopping the locked previous process.
- Verified `GET /api/admin/ice-rink-rentals/import-runs` was reachable after container setup.
- Saved a local-only dry-run ImportRun smoke record for `ice-rink-rentals`.
- Confirmed `GET /api/admin/ice-rink-rentals/import-runs` returned the saved run.
- Confirmed `GET /api/admin/ice-rink-rentals/import-runs/{id}` returned detail with status `dry_run` and `deploymentTriggered` false.
- Confirmed `GET /api/admin/roller-rink-rentals/import-runs` returned a separate tenant-scoped list with no Ice smoke record.
- Confirmed the admin Import History route returned HTTP 200 from the local admin dev server.
- No Page documents were created during runtime verification.
- No import write, static export, Azure deployment, Cloudflare purge, hard delete, provider research, state research, or production page creation occurred.
- A local-only ImportRun smoke record remains in the local Cosmos Emulator for audit-route verification; it is not a repo artifact.

## Combined Phase 6Q/6R Pre-Commit Smoke Test

- Ran `git status --short` and confirmed the worktree contains the expected Phase 6Q/6R source, docs, and report changes only.
- Confirmed no git changes under protected local/generated paths: `apps/ice-rink-web/.env.local`, `apps/pumpkin-api/appsettings.Development.json`, `.static-release-dry-runs`, `.static-artifacts`, `.static-content-snapshots`, `.next`, or `node_modules`.
- Confirmed the local admin app was reachable on port 3000.
- Pumpkin API was initially unreachable, then started locally on `http://localhost:5064`; Swagger returned HTTP 200.
- Confirmed local Cosmos Emulator container `ImportRun` exists with partition key `/tenantId` using a temporary helper outside the repo. The helper did not print connection strings or secrets.
- Confirmed unauthenticated `GET /api/admin/ice-rink-rentals/import-runs` returned HTTP 401.
- No safe admin JWT was available from an existing browser session without exposing token material, so the combined smoke test did not create a new authenticated ImportRun record. Authenticated save/list/detail behavior remains covered by the earlier local runtime verification above and should be rechecked through the browser before commit if a current admin session is available.
- No Page documents were created or modified during this combined smoke test.
- No import write, static export, Azure deployment, Cloudflare purge, hard delete, provider research, state research, production page creation, email sending, or protected config change occurred.

## Known Limitations

- ImportRun stores summaries, not full content snapshots.
- PATCH for notes/status is deferred.
- Write-import audit saving is manual after result display rather than automatic.
- CSV/XLSX can save result summaries, but JSON remains the recommended format for production content packages.

## Next Recommended Phase

Add an approval artifact that links staged package status, contract validation, diff preview, dry-run report, ImportRun history, and reviewer notes before production write imports.
