# Schema Contract Validation Result

Validation command:

```powershell
node src/outbound-link-cli.mjs validate-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
```

Result:

- status: passed
- failures: 0
- warnings: 0
- required production record files present: yes
- manifest count check: passed
- checksum validation: passed
- state hash shape validation: passed
- tenant/site partition validation: passed
- secret-like value scan: passed
- live-write flag validation: passed

Negative fixtures were added for tenant mismatch and secret-like URL validation.

