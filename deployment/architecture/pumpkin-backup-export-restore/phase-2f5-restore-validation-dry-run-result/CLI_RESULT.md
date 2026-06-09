# CLI Result

The CLI now supports:

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/tenant-standard-backup --out .tmp/tenant-restore-plan --overwrite
```

The command:

- requires a bundle path;
- requires an output path under `.tmp`;
- runs backup validation first;
- refuses invalid bundles;
- writes restore-plan reports only;
- prints non-secret status fields only;
- exits non-zero when restore validation fails.

Convenience scripts were added:

- `npm run restore:tenant`
- `npm run restore:platform`
