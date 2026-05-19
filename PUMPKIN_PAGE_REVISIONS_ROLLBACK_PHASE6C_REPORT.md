# Pumpkin Page Revisions / Rollback Phase 6C Report

## Executive Summary

Phase 6C adds a safe revision and rollback foundation for existing CMS Page documents without creating provider research files, state research packages, production pages, hard delete behavior, Azure deployment, or Cloudflare changes.

The chosen MVP approach stores one latest pre-update snapshot inside the existing Page document at `revision.latestSnapshot`. This avoids introducing a new Cosmos container before production container setup is planned, while still giving admin edits, lifecycle actions, and import updates a recoverable previous state.

## Chosen Revision Storage Approach

Approach C was selected for this phase:

- No new Cosmos container is required.
- Existing `Page` documents now carry revision metadata and one latest snapshot.
- Every admin update through the JWT admin update endpoint creates a pre-write snapshot.
- Rollback restores the latest stored snapshot and creates a new snapshot before restoring.

Future work can move this into a dedicated `PageRevision` collection/container when long-term retention, cleanup, diffs, and deeper history are needed.

## Files Changed

- `apps/pumpkin-net-models/Models/Page.cs`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/*`
- `apps/pumpkin-api/Services/PageRevisionHelper.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/admin/src/lib/api.ts`
- `apps/admin/src/app/dashboard/pages/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/page.tsx`
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`

## Data Model Changes

`PageRevisionMetadata` now supports:

- `currentRevisionId`
- `revisionNumber`
- `lastSnapshotAt`
- `rollbackAvailable`
- `lastChangeSummary`
- `lastChangedBy`
- `lastChangeSource`
- `lastChangeAt`
- `latestSnapshot`

Allowed change sources:

- `admin_editor`
- `json_import`
- `csv_import`
- `xlsx_import`
- `lifecycle_action`
- `rollback`
- `cms_snapshot`
- `manual_unknown`

`latestSnapshot` stores the previous Page document with nested snapshots removed to prevent recursive growth.

## API Changes

`PUT /api/admin/pages/{tenantId}/{pageSlug}` now accepts optional query metadata:

- `changeSource`
- `changeSummary`

Before replacing an existing Page, the API:

- loads the current Page
- stores a latest pre-update snapshot
- increments `revision.revisionNumber`
- updates `revision.currentRevisionId`
- records changed-by/source/summary timestamps
- sets `staticPublishing.needsRebuild = true`
- sets `staticPublishing.deploymentStatus = pending_rebuild` when appropriate
- updates workflow last-edited metadata

New rollback endpoint:

- `POST /api/admin/pages/{tenantId}/{pageSlug}/rollback`

Rollback is JWT-authenticated and tenant-scoped. It restores only the latest snapshot, checks for target slug collision, creates a new snapshot before restore, and does not delete anything.

## Admin Changes

The structured page editor now has:

- a change summary field for the next save
- revision metadata display
- latest snapshot indicator
- updated copy explaining Phase 6C snapshot behavior

The read-only page detail view now has:

- revision metadata display
- a guarded "Rollback to latest snapshot" button when a snapshot exists
- inline rollback success/error states
- no hard delete, diff viewer, or timeline UI

The page list publish/unpublish action now passes:

- `changeSource: lifecycle_action`
- a clear change summary

The legacy page editor route also passes `changeSource: admin_editor` for compatibility.

## Import / Export Changes

JSON import/export preserves the full Page shape, including new revision fields.

CSV/XLSX flat exports now include revision columns for:

- `revision.currentRevisionId`
- `revision.lastSnapshotAt`
- `revision.lastChangeSource`
- `revision.lastChangeSummary`
- `revision.lastChangedBy`
- `revision.lastChangeAt`
- existing rollback fields
- full `revision` JSON

Import write behavior:

- dry-run creates no revisions
- create-only creates new pages without previous snapshots
- update-only and upsert updates use the admin update endpoint and create snapshots
- import reports show whether a revision snapshot was reported by the API response

## Static Publishing Impact

Admin updates, lifecycle changes, import updates, and rollbacks mark changed pages as needing a static rebuild where the field exists.

Static validation and CMS snapshot validation now warn when published pages have:

- no `revision.currentRevisionId`
- no rollback snapshot available

These warnings are advisory and do not fail static builds.

## Cosmos Setup

No new Cosmos container is required for Phase 6C.

The existing `Page` container continues to be the only storage needed. A future `PageRevision` container should use tenant-scoped partitioning if deeper revision history is added.

## Checks Run

Passed:

- `npm run type-check` in `apps/admin`
- targeted `npm run lint` for changed admin files
- `dotnet build` in `apps/pumpkin-net-models`
- `dotnet build` in `apps/pumpkin-api`
- `npm run type-check` in `apps/ice-rink-web`
- targeted `npm run lint` for changed static scripts
- `npm run build` in `apps/ice-rink-web`
- `npm run validate:static:ice`
- `npm run validate:static:roller`
- `npm run validate:snapshot:ice`
- `npm run validate:snapshot:roller`
- `npm run export:static:ice`
- `npm run export:static:roller`
- `git diff --check`
- targeted changed-file secret-pattern scan
- confirmed no `.env.local` or `appsettings.Development.json` changes were present in the diff
- confirmed no `research/` files were changed by this phase

Notes:

- The first parallel Roller static export hit a `.next` rename race while Ice was building. Roller passed when rerun by itself.
- The local `pumpkin-api` process was stopped because it was locking the model/API build DLLs, then restarted on `http://localhost:5064` after checks.
- The secret-pattern scan reported code references such as `apiKey` variable names and built-in detector strings, not committed credential values.

## Runtime Verification

Build-time and static-publishing verification passed. Direct browser/admin mutation testing was not performed in this turn because no admin JWT was present in the shell and no local credentials were exposed. The API update, import, lifecycle, and rollback paths compile and are wired through the same authenticated admin update contract.

## Admin Detail Freshness Fix

After Phase 6C local admin use, the editor was saving correctly, but the read-only detail screen could appear stale after returning from the editor. Reopening the editor showed the saved value, which pointed to admin route/client freshness and detail-display behavior rather than a failed API write.

Root cause:

- The editor returned to the same detail URL after save.
- Next App Router could reuse the previous client route state for that detail URL.
- The admin API client did not explicitly opt GET requests out of browser caching.
- The detail page also did not show several high-confidence edited fields as first-class rows, so admins had to hunt through nested JSON to confirm changes.

Fix:

- `apps/admin/src/lib/api.ts`
  - Admin GET requests now default to `cache: "no-store"`.
  - `getPage()` and `getPages()` append a timestamp cache-buster query.
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
  - Detail navigation now appends a `fresh` query token.
  - The editor reload effect observes the `fresh` token.
  - Save success copy includes the returned revision ID when available.
- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`
  - The detail reload effect observes the `fresh` token.
  - Edit navigation also appends a `fresh` token.
  - Key fields are now explicit rows in the detail view:
    - Page Title / H1
    - Page Slug
    - `MetaData.description`
    - `seo.metaTitle`
    - `seo.metaDescription`
    - `isPublished`
    - `includeInSitemap`
    - revision ID/number/source/summary
    - rollback availability/latest snapshot
    - `staticPublishing.needsRebuild`

Freshness verification status:

- Code-level verification passed through admin type-check and targeted lint.
- Direct browser runtime verification still needs to be performed in a logged-in admin session. No admin JWT was present in the shell and no credentials were exposed in this report.
- Rollback browser verification was not performed in this turn for the same reason.

## Known Limitations

- Only the latest pre-update snapshot is retained.
- There is no full timeline, visual diff, retention policy, or cleanup job yet.
- Rollback restores the latest snapshot only.
- Snapshot storage increases Page document size.
- Unknown fields outside the typed Page model are subject to the same typed replacement limitations that existed before this phase.
- Static validation warnings are advisory, not launch-blocking.

## Next Recommended Phase

Phase 6D should add a small revision history viewer or a real `PageRevision` container design if Timothy wants more than one recoverable revision per page. The next safe implementation step is a local runtime proof: edit one existing test page, confirm `revision.latestSnapshot`, then rollback that test page and confirm the public/static rebuild warning state.
