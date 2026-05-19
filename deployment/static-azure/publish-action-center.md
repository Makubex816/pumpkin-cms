# Publish Action Center

The Publish Action Center is an admin-side operator page for the Option C static-first publishing workflow.

It lives at:

```text
/dashboard/publishing/action-center
```

The page is tenant-scoped and uses the current admin tenant selector. It does not deploy, run shell commands, read local folders, upload files to Azure, or purge Cloudflare.

## Intended Workflow

1. Review the Publishing Dashboard for the selected tenant.
2. Apply safe metadata repairs if needed.
3. Run the CMS snapshot command locally.
4. Validate the CMS snapshot locally.
5. Export the static site from the CMS snapshot locally.
6. Run the static publish dry-run locally.
7. Paste or upload the dry-run manifest into the Publish Action Center.
8. Review tenant/domain/readiness correlation before any manual Azure upload.

## Commands

From `apps/ice-rink-web`, Ice uses:

```powershell
npm run snapshot:cms:ice
npm run validate:snapshot:ice
npm run export:static:ice:cms
npm run publish:dry-run:cms
```

From `apps/ice-rink-web`, Roller uses:

```powershell
npm run snapshot:cms:roller
npm run validate:snapshot:roller
npm run export:static:roller:cms
npm run publish:dry-run:cms
```

`npm run publish:dry-run:cms` currently packages both Ice and Roller release folders from the CMS snapshot source. Review the matching tenant section in the manifest.

## Manifest Location

The dry-run script writes:

```text
.static-release-dry-runs/<runId>/static-publish-dry-run-manifest.json
.static-release-dry-runs/<runId>/STATIC_PUBLISH_DRY_RUN_SUMMARY.md
```

Generated dry-run folders are ignored by git and should not be committed.

## Using The Admin Viewer

Paste or upload `static-publish-dry-run-manifest.json` in the action center.

The viewer displays:

- run ID
- release folder
- content source
- site count
- per-site site key and domain
- upload root
- file count
- ready-for-manual-upload state
- content warning count
- redirect count
- page quality warning count
- manifest and summary paths where available or inferable

The summary markdown can be pasted or uploaded separately and is shown as plain preformatted text.

## Readiness Correlation

The action center compares the pasted manifest with the currently selected tenant.

It warns when:

- the manifest does not include the selected tenant
- the manifest domain does not match the expected tenant domain
- the manifest is not from `cms-snapshot`
- `readyForManualUpload` is false
- dry-run validation or canonical checks failed
- secret scan failed
- the manifest is older than recorded CMS page edits
- current pages still show `staticPublishing.needsRebuild`

## Local Browser History

Admins can store recently pasted dry-run manifest summaries in local browser storage.

This history is not authoritative. It is only a convenience view and should later be replaced by a real CMS publish/build history collection.

## Azure Staging Relationship

Use the action center before following the Azure Static Web Apps staging runbooks.

The action center answers:

- which dry-run package was reviewed
- whether it matches the selected tenant/domain
- whether it is CMS-snapshot based
- whether the package is ready for manual upload
- whether current CMS pages still need rebuild or review

It does not replace the staging DNS checklist, Azure runbooks, Cloudflare checklist, or final preflight checklist.

## Limitations

- No deployment is performed from the browser.
- No shell commands are run from the browser.
- No local dry-run folder is read automatically.
- Local browser history is not a server-side audit trail.
- A future phase should add a tenant-level publish/build history collection and deployment status records.
