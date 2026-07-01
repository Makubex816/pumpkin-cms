# Local Restore Dry-Run Result

Classification: `local_restore_dry_run_passed_with_identity_and_secret_restore_gaps`

Dry-run checks:

| Check | Result |
| --- | --- |
| Required paths | Passed, 17 required paths present. |
| JSON parse | Passed, 16 JSON files parsed. |
| Checksum verification | Passed, 26 checksum lines verified. |
| Media verification | Passed, 9 blobs verified by bytes and SHA-256. |
| Live mutation | Not performed. |

Restore gaps remain for user identity, secret-like runtime values, and live restore adapter approval.
