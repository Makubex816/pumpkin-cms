# Restore Validation Simulation

`simulate-restore-validation` reads a local Backup Center export and checks whether outbound link state would survive a restore comparison.

Command:

```powershell
node src/outbound-link-cli.mjs simulate-restore-validation --export .tmp/backup-center-export --out .tmp/restore-validation --overwrite
```

Checks:

- backup export validation status;
- link count preserved;
- instance count preserved;
- policy state preserved;
- render decisions preserved;
- disabled statuses preserved.

No live restore is performed.
