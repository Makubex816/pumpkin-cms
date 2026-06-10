# Local Fake Generator QA Result

Command exercised:

```powershell
node src/backup-cli.mjs create-complete-standard --profile fake-complete --out .tmp/phase-2f14-backup-generator-qa/fake-complete --download --download-out .tmp/phase-2f14-backup-generator-qa/fake-download --overwrite
```

Result:

| Field | Value |
| --- | --- |
| Profile | `fake-complete` |
| Bundle path | `.tmp/phase-2f14-backup-generator-qa/fake-complete/` |
| Content file count | 49 |
| Validation | passed |
| Checked files | 54 |
| Checksum entries | 50 |
| Secret scan | passed |
| Restore-plan result | passed |
| Download package result | packaged |
| ZIP bytes | 69,201 |
| ZIP SHA-256 | `0aa2a48c71db4cc65fa2308196fe6abd99253cd2c7260858a0a0841c09fa2a3c` |

Fake mode remained offline and fixture-only.
