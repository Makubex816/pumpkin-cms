# Source Of Truth Ownership Matrix

| Source | Owner | Backup Connector | Current Status | Next Work |
| --- | --- | --- | --- | --- |
| Pumpkin CMS API content | CMS operator | CMS read-only exporter | Wired | Keep GET-only export and redaction checks |
| API database provider config | Platform operator | DB provider discovery connector | Missing | Add presence-only provider discovery |
| Cosmos DB live data | Platform operator | Cosmos inventory/export connector | Planned | Confirm account/database/container under approval |
| Azure SQL database | Platform operator | Azure SQL/BACPAC connector | Not discovered | Keep optional connector, do not assume Ice uses it |
| MongoDB live data | Platform operator | Mongo connector | Optional | Activate only if provider says MongoDB |
| MediaAsset registry | CMS operator | CMS media metadata exporter | Wired | Join to blob source map |
| Azure media blobs | Platform operator | Blob inventory/copy connector | Partially discovered | Add read-only blob inventory and copy mode |
| Static output | Web operator | Static evidence collector | Partially wired | Attach public bundle model |
| Contact form endpoint | Forms/email operator | Endpoint evidence collector | Documented no-email mode | Real email remains separate approval |
| Cloudflare DNS/CDN | DNS operator | DNS evidence collector | Documented from prior safe reports | No mutation in Backup Center |
| Config inventory | Platform operator | Redacted config inventory connector | Partially wired | Add profile-aware presence matrix |
| Backup storage | Backup operator | Backup storage connector | Local `.tmp` only | Define private retention target later |
| Restore validation | Backup operator | Restore-plan runner | Wired dry-run | Extend DB/media completion mode |

