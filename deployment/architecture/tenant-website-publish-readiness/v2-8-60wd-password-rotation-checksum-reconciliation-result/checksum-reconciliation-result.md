# Checksum Reconciliation Result

Status: passed.

Rule applied:

The authoritative hardcopy hash is the computed `Get-FileHash` value when it matches the hardcopy `.sha256` file and redacted proof field.

Result:

| File | Computed SHA-256 | Matches `.sha256` file | Matches redacted proof |
| --- | --- | --- | --- |
| TXT | `8e99e59b6680d07cfa1c88db9126f4732da209d5ebccf4c8d0cf0d854d54b609` | yes | yes |
| JSON | `db20d6dd07ebf113ad7455fc19751d9d8d6fa1af1ad603b3d17090fbe853c189` | yes | yes |

Conclusion:

- Authoritative TXT SHA-256: `8e99e59b6680d07cfa1c88db9126f4732da209d5ebccf4c8d0cf0d854d54b609`.
- Authoritative JSON SHA-256: `db20d6dd07ebf113ad7455fc19751d9d8d6fa1af1ad603b3d17090fbe853c189`.
- The prior prompt-provided TXT value is classified as a transcription error.

Hardcopy TXT/JSON contents were not read, printed, copied, parsed, or written to repo files.

