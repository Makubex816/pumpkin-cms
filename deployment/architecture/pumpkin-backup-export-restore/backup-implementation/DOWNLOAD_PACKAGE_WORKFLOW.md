# Download Package Workflow

Phase 2F-13 adds an optional local downloadable ZIP writer for already validated standard backup folders.

## Command

```powershell
node src/backup-cli.mjs package-download --bundle .tmp/phase-2f13-unified-backup-generator/fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-download --overwrite
```

The command writes:

- `standard-backup-download.zip`
- `DOWNLOAD_PACKAGE_RESULT.json`
- `DOWNLOAD_PACKAGE_RESULT.md`

The output path must resolve under this package's ignored `.tmp` directory. The ZIP is generated after the source bundle passes validation. The writer uses a local ZIP container and does not upload the package or mutate any external system.

## Bundle Rules

The source bundle must:

- live under `.tmp`;
- be a folder, not an archive path;
- pass the requested validation mode;
- exclude escrow payloads;
- exclude protected config and secret-like values;
- have matching checksums.

## Retention

Download packages are convenience artifacts. They are not staged into Git and are not treated as durable retention. Operators should remove generated ZIPs after review unless a separate owner-approved retention process captures them.
