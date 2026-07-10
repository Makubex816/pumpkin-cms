# API Package Verification

The OSD package was found to contain Windows-style ZIP entries. It was not reused.

OSE rebuilt the package outside the repo with explicit forward-slash entry names.

| Check | Result |
| --- | --- |
| Package path | `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61ose\api-v2-8-61ose-posix.zip` |
| SHA-256 | `B1FDB8ECD6A37399F2079CA79832A101FAF9B603DCAEC021A79D3DD7A13467D2` |
| Bytes | `11816252` |
| ZIP entries | `56` |
| Backslash ZIP entries | `0` |
| `appsettings*.json` entries | `0` |
| `.tmp` entries | `0` |
| Protected/secure staging entries | `0` |

The package was not staged into Git.

