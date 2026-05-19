# Publish Run Registry

Phase 6H adds a tenant-scoped publish/build run registry to Pumpkin CMS.

The registry stores static dry-run/build metadata only. It does not upload static artifacts, deploy to Azure, purge Cloudflare, run shell commands, or mark pages as deployed.

## What A PublishRun Records

Each `PublishRun` stores:

- tenant/site key
- public domain
- dry-run `runId`
- content source, such as `cms-snapshot` or `seed-sites`
- run type, such as `static_dry_run`
- readiness status
- relative release folder path
- relative manifest and summary paths
- import timestamp
- site summaries
- file count
- redirect count
- page quality warning count
- content warning count
- ready-for-manual-upload flag
- warnings and errors
- deployment target and deployment status placeholders

## What Is Not Stored

The registry should not store:

- API keys
- connection strings
- Azure tokens
- Cloudflare tokens
- `.env` paths or files
- `appsettings.Development.json`
- local absolute filesystem paths
- full static output files
- raw secrets from generated artifacts

The API sanitizes path-like fields and rejects publish-run saves that do not match the selected tenant.

## Generated Folders Versus CMS History

Generated dry-run folders live locally under:

```text
.static-release-dry-runs/<runId>/
```

Those folders are ignored by git and are not the permanent record.

The CMS `PublishRun` record is the lightweight, tenant-scoped history summary that can be viewed across browsers and admin sessions.

## Admin Workflow

1. Run CMS snapshot/static dry-run locally.
2. Open `/dashboard/publishing/action-center`.
3. Paste or upload `static-publish-dry-run-manifest.json`.
4. Review tenant/domain/readiness warnings.
5. Click `Save To CMS History`.
6. Confirm the run appears in `CMS Publish Run History`.
7. Review the latest run summary on the Publishing Dashboard.

The Action Center still keeps optional local browser history, but CMS history is the persistent foundation.

## API Endpoints

```text
GET  /api/admin/{tenantId}/publish-runs
GET  /api/admin/{tenantId}/publish-runs/{id}
POST /api/admin/{tenantId}/publish-runs
```

All endpoints require JWT admin authentication and enforce tenant scope. SuperAdmin can access other tenants using the same pattern as the existing admin page endpoints.

## Cosmos Setup

Phase 6H uses a dedicated Cosmos container:

```text
Container: PublishRun
Partition key: /tenantId
```

Local Cosmos Emulator setup should add this container to the existing Pumpkin database before using CMS publish history.

If the container is missing, page editing and static export still work, but publish-run history list/save calls will fail until the container is created.

## Deployment Status

`PublishRun.deploymentStatus` defaults to:

```text
not_deployed
```

Saving a dry-run record does not:

- clear page `staticPublishing.needsRebuild`
- set page `lastDeployedAt`
- mark any page as deployed
- trigger Azure upload
- trigger Cloudflare purge

Future deployment phases can update deployment records after a real upload/cutover.

## Future Work

Future phases can add:

- deployment status updates
- Azure Static Web Apps staging records
- Cloudflare purge records
- release artifact checksums
- rollback/cutover links
- server-side publish-run detail screens
