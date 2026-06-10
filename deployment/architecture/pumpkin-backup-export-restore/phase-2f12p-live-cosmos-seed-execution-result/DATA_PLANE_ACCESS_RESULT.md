# Data-Plane Access Result

Status: blocked

Attempted method:

- Azure AD/RBAC Cosmos data-plane access
- token acquired through Azure CLI process memory only
- token not printed
- token not persisted by the Backup Center runner

Result:

- first tenant-scoped count query against `tenants` returned HTTP 403
- Cosmos reported missing native RBAC permission for `Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/executeQuery`
- `az cosmosdb sql role assignment list` returned no native Cosmos SQL role assignments for the account

Because data-plane read access was unavailable without keys/listKeys, connection strings, SAS, or protected config, the runner stopped before any write.
