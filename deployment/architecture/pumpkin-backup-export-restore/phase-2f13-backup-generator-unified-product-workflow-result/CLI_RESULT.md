# CLI Result

New CLI commands:

```powershell
node src/backup-cli.mjs create-complete-standard --profile fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-complete --overwrite
node src/backup-cli.mjs create-ice-complete-standard --profile live-readonly --out .tmp/phase-2f13-unified-backup-generator/ice-complete-standard --overwrite
node src/backup-cli.mjs package-download --bundle .tmp/phase-2f13-unified-backup-generator/ice-complete-standard --out .tmp/phase-2f13-unified-backup-generator/ice-download-recheck --overwrite
```

New package scripts:

```powershell
npm run create:complete-standard-fake
npm run create:complete-standard-fake-download
npm run create:ice-complete-standard-live
npm run create:ice-complete-standard-live-download
npm run package-download:fake
npm run package-download:ice
```

CLI safety result:

| Check | Result |
| --- | --- |
| Output outside `.tmp` rejected | yes |
| Archive-style bundle output rejected | yes |
| Download package output under `.tmp` | yes |
| Secrets printed by commands | no |
| Tokens persisted by runner | no |
| Generated artifacts staged | no |
