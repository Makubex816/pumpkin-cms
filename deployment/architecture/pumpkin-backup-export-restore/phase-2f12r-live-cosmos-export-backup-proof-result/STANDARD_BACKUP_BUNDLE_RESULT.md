# Standard Backup Bundle Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs create-ice-cosmos-export-backup --export .tmp/phase-2f12r-live-cosmos-export --out .tmp/phase-2f12r-ice-standard-backup-with-cosmos-export --overwrite
```

Bundle summary:

- Bundle mode: `standard`
- Scope: tenant
- Tenant: `ice-rink-rentals`
- Source: `real-ice-readonly-standard`
- `includesEscrow`: false
- Content file count: 35
- Database component: complete Cosmos portable JSON
- Cosmos record sets: 10
- Cosmos records: 27
- Media component: partial, metadata only
- Media copied blobs: 0

Backup manifest SHA256:

`18BA56200DF00F5A118414DBDD5AC022E222911EDF5D4DC1117C8A5D60718521`
