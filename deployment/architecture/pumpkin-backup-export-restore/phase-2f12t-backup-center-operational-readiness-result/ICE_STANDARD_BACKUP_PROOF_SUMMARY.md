# Ice Standard Backup Proof Summary

Status: achieved

Source evidence: Phase 2F-12S media blob full-copy proof result.

Complete standard backup candidate:

| Field | Result |
| --- | --- |
| Backup mode | `standard` |
| Validator mode | `production-restore-proof` |
| Status | passed |
| Tenant | `ice-rink-rentals` |
| Includes escrow | false |
| Content file count | 51 |
| Database component | complete |
| Cosmos records | 27 |
| Media component | complete |
| Media copied blobs | 9 |
| Tenant website bundle | complete |
| Manifest SHA-256 | `72185294647D5A25F067F13803315DBA82C26C2B34BEC572DB3F228D1C93F068` |

What is proven:

- The current seeded Ice Cosmos dataset can be represented as a tenant-scoped portable JSON standard backup component.
- The approved Ice media blobs can be represented as a full-copy media backup component with checksums.
- The standard backup candidate validates with database, media, and tenant website bundle components complete.
- The standard backup excludes encrypted escrow and secret values.

What is not proven:

- A live restore has not been executed.
- CMS runtime has not been switched to Cosmos.
- CMS/API write paths have not been exercised.
- Deployment, indexing, and live-page publication remain hard-stopped.
