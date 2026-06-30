# Backup Restore Runbook

Use this as an operator guide only; V2.8.45 did not restore anything.

1. Confirm subscription `ff887def-fd83-4a19-9298-13d4b1687873` and operator identity.
2. For Cosmos document recovery, use continuous backup/PITR for `cosmos-pumpkin-prod-eastus`; select a restore timestamp after confirming blast radius and tenant scope.
3. For App Service code/config rollback, prefer deployment artifacts/source-controlled release process; platform snapshots are visible for emergency restore investigation.
4. Do not use custom App Service backup without a new approval that permits the required storage/SAS backup configuration.
5. For media recovery, use blob soft delete, container soft delete, blob versioning, and change feed on `iceskatingmedia` scoped to `ice-rink-rentals/assets/`.
6. Never use storage keys/listKeys/SAS or connection strings without explicit future approval.
