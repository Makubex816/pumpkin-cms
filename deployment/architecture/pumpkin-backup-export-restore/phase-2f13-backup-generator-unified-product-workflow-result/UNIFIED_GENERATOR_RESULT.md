# Unified Generator Result

The generator now supports two productized profiles.

| Profile | Command | Result |
| --- | --- | --- |
| `fake-complete` | `create-complete-standard` | Passed locally with fixture-only data and no live calls |
| `live-readonly` | `create-ice-complete-standard` | Passed with approved read-only Cosmos export and media copy proof paths |

Generated proof paths:

- Fake bundle: `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/fake-complete/`
- Fake restore plan: `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/fake-complete-restore-plan/`
- Fake download recheck: `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/fake-download-recheck/`
- Live Ice bundle: `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/ice-complete-standard/`
- Live Ice restore plan: `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/ice-complete-standard-restore-plan/`
- Live Ice download recheck: `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/phase-2f13-unified-backup-generator/ice-download-recheck/`

Live-readonly source proof summary:

| Evidence | Result |
| --- | --- |
| Cosmos account | `cosmos-pumpkin-prod-eastus` |
| Cosmos database | `pumpkin-prod-cms` |
| Tenant key | `ice-rink-rentals` |
| Cosmos record sets | 10 |
| Cosmos records | 27 |
| Media storage account | `iceskatingmedia` |
| Media container | `ice-rink-rentals-media` |
| Copied media blobs | 9 |
| Copied media bytes | 22,639,448 |

The Resource Registry is included as a redacted reference only. Encrypted handoff vault payloads and generated `.tmp` artifacts are not included in Git.
