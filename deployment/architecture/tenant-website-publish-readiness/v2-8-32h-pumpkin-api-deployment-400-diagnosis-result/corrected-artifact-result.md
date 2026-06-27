# Corrected Artifact Result

Corrected artifact:

`.tmp/v2-8-32h/pumpkin-api-posix.zip`

The artifact was repacked from `.tmp/v2-8-32c/pumpkin-api-publish` using ZIP entry names with `/` separators.

Observed structure:

| Field | Value |
| --- | --- |
| SHA256 | `4F10B7A16BA066D11BAFA0BE29DE77DBBAE1A29769F71B5CCB2658CA037EB46E` |
| Length | `11758516` bytes |
| ZIP entries | `56` |
| File entries | `56` |
| Root file count | `44` |
| Backslash entry count | `0` |
| App-settings-like entries | `0` |
| Root `pumpkin-api.dll` | present |
| Root `pumpkin-api.runtimeconfig.json` | present |
| Root `pumpkin-api.deps.json` | present |
| Root `web.config` | present |

No source code rebuild was required because the failure was packaging path separators, not compiled application output.
