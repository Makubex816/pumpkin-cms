# Live Cosmos Export Result

Status: passed

Command:

```powershell
node src/backup-cli.mjs cosmos-export:live-readonly --out .tmp/phase-2f12r-live-cosmos-export --overwrite
```

Output summary:

- Result: `exported-and-validated`
- Data-plane access: `available`
- Export mode: `live-readonly-portable-json`
- Record sets: 10
- Total records: 27
- Validation: passed

The export wrote portable JSON under ignored `.tmp` output only. CLI output did not print document contents or tokens.

Export manifest SHA256:

`FE415D249BD17EF3CC0E4B027A5530E8247C4E96E8CD4E6EA3C62FC8B1AFD14F`
