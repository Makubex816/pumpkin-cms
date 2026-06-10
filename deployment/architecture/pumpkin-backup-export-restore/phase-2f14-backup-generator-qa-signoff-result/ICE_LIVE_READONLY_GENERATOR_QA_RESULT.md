# Ice Live-Readonly Generator QA Result

Command exercised:

```powershell
node src/backup-cli.mjs create-ice-complete-standard --profile live-readonly --out .tmp/phase-2f14-backup-generator-qa/ice-complete-standard --download --download-out .tmp/phase-2f14-backup-generator-qa/ice-download --overwrite
```

Result:

| Field | Value |
| --- | --- |
| Profile | `live-readonly` |
| Bundle path | `.tmp/phase-2f14-backup-generator-qa/ice-complete-standard/` |
| Content file count | 57 |
| Validation | passed |
| Checked files | 62 |
| Checksum entries | 58 |
| Secret scan | passed |
| Restore-plan result | passed |
| Download package result | packaged |
| ZIP bytes | 23,329,711 |
| ZIP SHA-256 | `50440433a25a1a1607efc1676c7504d2543e50daa85862545553c4d34425d847` |

Live-readonly source proof:

| Source | Result |
| --- | --- |
| Cosmos proof | exported-and-validated |
| Cosmos account | `cosmos-pumpkin-prod-eastus` |
| Cosmos database | `pumpkin-prod-cms` |
| Tenant key | `ice-rink-rentals` |
| Cosmos record sets | 10 |
| Cosmos records | 27 |
| Media proof | copied-and-validated |
| Storage account | `iceskatingmedia` |
| Storage container | `ice-rink-rentals-media` |
| Media blobs copied | 9 |
| Media bytes copied | 22,639,448 |

Boundary confirmation from generated proof manifests:

- read-only data-plane access: true
- keys/listKeys: false
- connection strings read: false
- SAS generated: false
- Cosmos writes: false
- storage mutation: false
