# Backup Center Runtime QA Requirements

## Reason

Contact persistence changes can create new production `FormEntry` records. Before enabling that path, Backup Center evidence should prove that the active provider target can be exported, verified, and restored according to the platform's backup posture.

## Required before production contact binding

| Requirement | Status | Notes |
| --- | --- | --- |
| Current Resource Registry metadata | Partially satisfied | V2.8.32A current metadata refreshed Azure resource presence |
| Production Cosmos export proof | Carryforward exists | 2F-12R live Cosmos export proof carried forward |
| Active API provider proof | Missing | Cannot be proven until a live API host exists |
| Admin read-only export/read check | Missing | Requires approved API target and auth |
| Backup Center rollback reference | Required | Must identify restore point and rollback owner before production write |
| Post-binding backup smoke | Required | After isolated runtime QA, ensure newly created test record is observable in backup/export path |

## Non-negotiable boundary

No backup proof should require printing secrets, querying Key Vault secrets, listing account keys, exporting connection strings, or dumping production customer payloads into the report.
