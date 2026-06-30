# Custom Backup Deferred Plan If Needed

Custom App Service backups were not configured in V2.8.45.

Reason: App Service custom backup configuration requires a backup storage destination and typically SAS-style backup settings. V2.8.45 explicitly disallowed SAS generation, storage account key use, connection string generation, Key Vault secret reads, and protected config reads.

Next approval prompt:

Approve V2.8.45A App Service Custom Backup Configuration only: configure custom App Service backups for `app-pumpkin-api-prod-centralus-001`, `app-pumpkin-admin-prod-centralus-001`, and `app-pumpkin-admin-isolated-centralus-001` using an approved backup storage destination and explicit permission for the minimum required SAS/backup configuration mechanism. Do not deploy code, do not read protected appsettings/local settings, do not mutate DNS/indexing, do not POST contact forms, and do not inspect or mutate tenant content records.
