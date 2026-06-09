# Container Readback Result

All approved containers were read back under database `pumpkin-prod-cms`.

| Container | Partition key | Indexing mode |
| --- | --- | --- |
| `tenants` | `/tenantKey` | consistent |
| `sites` | `/tenantKey` | consistent |
| `pages` | `/tenantKey` | consistent |
| `routes` | `/tenantKey` | consistent |
| `forms` | `/tenantKey` | consistent |
| `mediaAssets` | `/tenantKey` | consistent |
| `themes` | `/tenantKey` | consistent |
| `publishRuns` | `/tenantKey` | consistent |
| `importRuns` | `/tenantKey` | consistent |
| `users` | `/tenantKey` | consistent |

Count expected: 10.

Count verified: 10.

No Cosmos documents were exported or read.

