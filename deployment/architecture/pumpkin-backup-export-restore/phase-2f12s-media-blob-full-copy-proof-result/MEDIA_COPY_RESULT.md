# Media Copy Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs media-copy:live-readonly --out .tmp/phase-2f12s-media-blob-copy --overwrite
```

Output summary:

- Result: `copied-and-validated`
- Data-plane access: `available`
- Approved blobs: 9
- Copied blobs: 9
- Total bytes: 22,639,448
- Validation: passed
- Generated: `2026-06-10T01:48:04.825Z`
- Local bundle path strategy: short deterministic SHA-256 paths under `media/blobs/ice-rink-rentals/`, with original Azure blob names retained in `media/blob-map/blob-map.json`.
- Max local bundle path length: 97 characters.

The media files were copied under ignored `.tmp` output only:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f12s-media-blob-copy/media/blobs/`

Blob map SHA256:

`003593C262224A8875471BC5045ED8F049EB1F3BE16736CEEA44BC6BAF1A44EA`
