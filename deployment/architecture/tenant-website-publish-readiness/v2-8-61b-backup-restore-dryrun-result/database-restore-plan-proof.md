# Database Restore Plan Proof

Status: passed.

The dry-run parsed and planned restore coverage for:

| Domain | Count | Dry-Run Result |
| --- | ---: | --- |
| Tenant | 1 | planned |
| Sanitized users | 1 | planned with password reset/credential workflow required |
| Pages | 5 | planned |
| MediaAssets | 13 | planned after media blob plan |
| Themes | 1 | planned |
| FormDefinitions | 1 | planned |
| FormEntries | 0 | planned if policy allows and records exist |
| ImportRuns | 0 | planned if policy allows and records exist |
| PublishRuns | 0 | planned if policy allows and records exist |
| DomainBindings | 1 | planned as pending/non-live |
| BackupRuns | 0 | production persistence not implemented |

Sanitized user export was checked for password hash/token/secret-like fields.
