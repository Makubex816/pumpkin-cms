# Backup Center Requirements

## Required before production contact binding

| Requirement | Status now | Required action |
| --- | --- | --- |
| Production Cosmos metadata | Present | Carry forward `cosmos-pumpkin-prod-eastus` / `pumpkin-prod-cms` |
| Backup/export proof | Carryforward exists | Re-run or refresh after live API binding |
| API provider proof | Missing | Run after App Service deployment |
| Admin readback proof | Missing | Run after Admin binding |
| Isolated write-read proof | Missing | Run one approved no-PII isolated POST |
| Backup observability of test entry | Missing | Confirm through Backup Center/export path |
| Rollback evidence | Missing | Record artifact and setting-name rollback manifest |

## Backup Center pass condition

Before production contact persistence is enabled, Backup Center evidence must show that the active provider target can be exported and that new `FormEntry` records are observable without exposing protected values or customer payloads in reports.

## Boundary

No backup action may print secrets, query Key Vault secret values, list storage/Cosmos keys, generate connection strings, generate SAS values, or dump raw production payloads into this package.
