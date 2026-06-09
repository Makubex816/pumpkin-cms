# Validator Result

Date: 2026-06-09

Command:

```powershell
npm run validate:ice
```

Result: passed.

## Validation Summary

| Check | Result |
| --- | --- |
| Checked files | 23 |
| Checksum result | passed |
| Checksum entries | 20 |
| Checksum files checked | 20 |
| Escrow exclusion | passed |
| Secret-leak scan | passed |
| Path safety | passed |
| Manifest file list | passed |
| Warning count | 0 |
| Failure count | 0 |

The validator confirmed that the standard backup contains only the `ESCROW_NOT_INCLUDED.md` escrow marker and no encrypted escrow payload.

