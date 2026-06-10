# RBAC Role Definition Result

Selected role: `Cosmos DB Built-in Data Contributor`

Role definition:

- `00000000-0000-0000-0000-000000000002`

Why this role was selected:

- `Cosmos DB Built-in Data Reader` supports metadata, query, change feed, and item read only.
- The guarded seed runner requires query/read plus item create for missing seed documents.
- `Cosmos DB Built-in Data Contributor` is the minimum built-in native role listed on the account that supports the required write path.

Permissions listed by Azure:

- `Microsoft.DocumentDB/databaseAccounts/readMetadata`
- `Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*`
- `Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*`

No custom role definition was created.
