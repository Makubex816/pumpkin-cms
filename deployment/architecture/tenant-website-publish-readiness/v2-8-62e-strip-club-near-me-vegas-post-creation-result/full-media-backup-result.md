# Full Media Backup Result

Status: passed complete RBAC media backup.

| Check | Result |
| --- | ---: |
| Storage account | `iceskatingmedia` |
| Container | `strip-club-near-me-vegas-media` |
| Prefix | `media/assets/` |
| Authentication | Azure login/RBAC |
| Canonical blobs | 302 |
| Unique names | 302 |
| Bytes | 28,343,976 |
| Zero-byte blobs | 0 |
| Missing local backup files | 0 |
| Per-blob SHA-256 values | 302 |
| Source-path aliases exported separately | 473 |

Every MediaAsset canonical blob path reconciled to exactly one downloaded blob. Storage keys, `listKeys`, connection strings, and SAS were not used.
