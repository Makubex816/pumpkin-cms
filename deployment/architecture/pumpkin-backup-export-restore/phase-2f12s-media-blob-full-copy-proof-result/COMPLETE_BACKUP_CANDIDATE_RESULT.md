# Complete Backup Candidate Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs create-ice-complete-standard-backup --export .tmp/phase-2f12r-live-cosmos-export --media .tmp/phase-2f12s-media-blob-copy --out .tmp/phase-2f12s-complete-ice-standard-backup --overwrite
```

Bundle summary:

- Bundle mode: `standard`
- Scope: tenant
- Tenant: `ice-rink-rentals`
- `includesEscrow`: false
- Generated: `2026-06-10T01:50:29.601Z`
- Created by: `backup-center-phase-2f12s-complete-standard-backup-runner`
- Requested by: `phase-2f12s-approved-media-blob-full-copy-proof`
- Content file count: 51
- Database component: complete Cosmos portable JSON
- Cosmos record sets: 10
- Cosmos records: 27
- Media component: complete Azure Blob full-copy proof
- Copied media blobs: 9
- Copied media bytes: 22,639,448
- Tenant website bundle index: complete

Backup manifest SHA256:

`72185294647D5A25F067F13803315DBA82C26C2B34BEC572DB3F228D1C93F068`
