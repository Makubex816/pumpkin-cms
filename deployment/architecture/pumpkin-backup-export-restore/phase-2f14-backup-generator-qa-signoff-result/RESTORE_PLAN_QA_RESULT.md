# Restore Plan QA Result

Commands exercised:

```powershell
node src/backup-cli.mjs restore-plan --bundle .tmp/phase-2f14-backup-generator-qa/fake-complete --out .tmp/phase-2f14-backup-generator-qa/fake-restore-plan-recheck --mode production-restore-proof --overwrite
node src/backup-cli.mjs restore-plan --bundle .tmp/phase-2f14-backup-generator-qa/ice-complete-standard --out .tmp/phase-2f14-backup-generator-qa/ice-restore-plan-recheck --mode production-restore-proof --expected-counts .tmp/phase-2f14-backup-generator-qa/ice-complete-standard-expected-counts.json --overwrite
```

Result:

| Bundle | Output | Scope | Dry-run only | Result |
| --- | --- | --- | --- | --- |
| Fake complete | `.tmp/phase-2f14-backup-generator-qa/fake-restore-plan-recheck/` | tenant | true | passed |
| Ice live-readonly | `.tmp/phase-2f14-backup-generator-qa/ice-restore-plan-recheck/` | tenant | true | passed |

No restore target was written.
