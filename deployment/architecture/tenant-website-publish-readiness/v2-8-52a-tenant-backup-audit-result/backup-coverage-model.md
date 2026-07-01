# Backup Coverage Model

Classification: `protected_backup_bundle_created_with_restore_gaps`

| Domain | Status | Count | Restore Note |
| --- | --- | ---: | --- |
| Tenant summary | Covered redacted | 1 | Secret-like fields redacted. |
| Pages | Covered | 3 | Rehydratable after target approval. |
| MediaAssets | Covered | 9 | Requires media binary mapping. |
| Media binaries | Covered | 9 | RBAC login copy; 22,639,448 bytes. |
| Themes | Covered | 1 | Rehydratable after target approval. |
| FormDefinitions | Covered | 1 | Rehydratable after target approval. |
| FormEntries | Covered protected PII | 4 | Restore requires explicit PII approval. |
| ImportRuns | Covered | 1 | Historical audit data. |
| PublishRuns | Covered | 1 | Historical audit data. |
| Users | Partial redacted | 1 | Requires controlled user reset/reseed. |
| Tenant package | Metadata covered | 1 | Summary only. |
| Static publish snapshot | Metadata covered | 1 | Static artifact copy is a future optional phase. |
| Resource map | Metadata covered | 1 | Read-only inventory summary. |
