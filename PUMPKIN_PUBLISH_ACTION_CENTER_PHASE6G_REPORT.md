# Pumpkin Publish Action Center Phase 6G Report

## Summary

Phase 6G adds a tenant-scoped Publish Action Center / Static Dry-Run History Viewer for the Option C static-first publishing workflow.

The new admin page helps operators follow the CMS-to-static sequence, paste or upload local dry-run manifest JSON, compare dry-run output against the selected tenant, and keep optional local browser history.

No Azure deployment, Cloudflare change, shell execution from the browser, hard delete, provider research, state research, scraping, production page creation, or active GitHub Actions workflow was added.

## Files Changed

- `apps/admin/src/app/dashboard/publishing/action-center/page.tsx`
- `apps/admin/src/app/dashboard/publishing/page.tsx`
- `apps/admin/src/app/dashboard/publishing/repairs/page.tsx`
- `apps/admin/src/lib/publishing-readiness.ts`
- `deployment/static-azure/README.md`
- `deployment/static-azure/publish-action-center.md`
- `PUMPKIN_PUBLISH_ACTION_CENTER_PHASE6G_REPORT.md`

## Route Added

The new admin route is:

```text
apps/admin/src/app/dashboard/publishing/action-center/page.tsx
```

Admin URL:

```text
/dashboard/publishing/action-center
```

The Publishing Dashboard now links to the Action Center. The Repair Metadata page also links back to the Action Center.

## Manifest Viewer Behavior

The Action Center supports paste or upload of:

```text
.static-release-dry-runs/<runId>/static-publish-dry-run-manifest.json
```

It parses and displays:

- run ID
- generated timestamp
- release folder
- content source
- manifest path
- summary path
- per-site site key/display name
- domain
- upload root
- file count
- ready-for-manual-upload state
- content warning count
- redirect count
- page quality warning count

The browser does not read `.static-release-dry-runs` automatically.

## Dry-Run Summary Behavior

The Action Center includes a second plain-text viewer for:

```text
STATIC_PUBLISH_DRY_RUN_SUMMARY.md
```

The summary is rendered as preformatted text only. No unsafe HTML rendering was added.

## Dry-Run History Behavior

Admins can store parsed manifest summaries in local browser storage.

Phase 6G history UX was tightened after runtime review:

- `Store In Local History` now reads the freshest localStorage history before writing.
- The current component state is updated immediately after the write.
- The same `runId` is replaced instead of duplicated.
- A success message appears beside the store button.
- A missing `runId` is treated as invalid manifest input.

History fields:

- run ID
- imported timestamp
- content source
- sites
- ready count
- warning count
- release folder

This history is explicitly labeled as local browser history only, not authoritative CMS build/deploy history.

## Readiness Correlation Behavior

The Action Center uses the same tenant page list and publishing-readiness helpers as the Publishing Dashboard.

It compares the current tenant with the pasted manifest and warns when:

- no manifest has been parsed
- manifest deployment/cloudflare flags are unexpectedly true
- manifest `contentSource` is not `cms-snapshot`
- selected tenant is missing from the manifest
- manifest domain does not match expected tenant domain
- `readyForManualUpload` is false
- source/release validation failed
- canonical validation failed
- secret scan failed
- manifest was generated before the latest recorded page edit
- current pages still show `staticPublishing.needsRebuild`

## Commands Shown

Ice tenant:

```powershell
cd apps/ice-rink-web
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run publish:dry-run:cms
```

Roller tenant:

```powershell
cd apps/ice-rink-web
npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms
npm run publish:dry-run:cms
```

The UI notes that `publish:dry-run:cms` currently packages both sites from CMS snapshot mode.

## Safety Limitations

- The browser does not run shell commands.
- The browser does not deploy to Azure.
- The browser does not purge Cloudflare.
- The browser does not read local dry-run folders automatically.
- The browser does not expose API keys.
- Local dry-run package folders remain generated ignored artifacts.
- Future authoritative build/deploy history should be stored server-side in a tenant-scoped CMS collection or tenant-level publishing record.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for `dashboard/publishing/action-center`, `dashboard/publishing`, `dashboard/publishing/repairs`, and `publishing-readiness` - passed
- targeted admin lint for the Action Center local-history fix - passed
- `GET http://localhost:3001/dashboard/publishing/action-center` - returned `200`
- `git diff --check` - passed with line-ending normalization warnings only
- protected config check for `.env.local` and `appsettings.Development.json` - no changes
- targeted high-confidence secret scan over changed files - passed

## Runtime Verification

Root cause of the local history UX issue:

- localStorage persistence worked, but the UI feedback lived down in the history section and the store path did not force a fresh localStorage-to-state update in the click path
- switching tenants remounted/refreshed enough state for the stored entry to appear, which confirmed persistence was valid but immediate UI feedback was incomplete

Fix verification:

- the store handler now updates local component state immediately after saving
- a visible success message is shown beside the `Store In Local History` button
- same-run history entries are updated/replaced by `runId`
- invalid manifests without `runId` are rejected before storing
- no browser shell execution, Azure deployment, or Cloudflare purge behavior was added

Automated local route verification confirmed:

- the admin dev route `/dashboard/publishing/action-center` returned HTTP `200`
- no browser action was added that can execute shell commands, deploy to Azure, or purge Cloudflare

Authenticated manual browser verification should still confirm with a local admin session:

1. Admin login works.
2. Publishing Dashboard opens.
3. Action Center link opens `/dashboard/publishing/action-center`.
4. Ice tenant displays the Ice command sequence and current readiness.
5. Pasted dry-run manifest parses and displays site rows.
6. Tenant/domain mismatch warnings appear when appropriate.
7. Roller tenant updates command/help text after switching.
8. No browser action attempts to deploy or run shell commands.

## Known Limitations

- Manifest history is local browser state only.
- No database-backed build history collection was added.
- No dry-run command execution was added to admin.
- No Azure/Cloudflare deployment automation was added.
- Summary markdown must be pasted or uploaded separately if the operator wants to view it in admin.

## Next Recommended Phase

Phase 6H should add a tenant-scoped publish/build history data model and read-only admin history screen, or pause feature work and run a staging dry-run using the Azure Static Web Apps runbook.
