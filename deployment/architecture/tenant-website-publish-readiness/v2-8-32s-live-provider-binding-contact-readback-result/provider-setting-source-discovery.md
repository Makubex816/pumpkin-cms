# Provider Setting Source Discovery

Source files inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/DatabaseSettings.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`

Discovered configurable provider/JWT settings:

| Purpose | Source | Appsetting name |
| --- | --- | --- |
| Database provider selector | `DatabaseSettings.SectionName`, `DatabaseSettings.Provider` | `Database__Provider` |
| Cosmos provider connection string | `CosmosDbSettings.ConnectionString` | `Database__CosmosDb__ConnectionString` |
| Cosmos database name | `CosmosDbSettings.DatabaseName` | `Database__CosmosDb__DatabaseName` |
| Admin JWT signing secret | `builder.Configuration.GetSection("Jwt")["SecretKey"]` | `Jwt__SecretKey` |

Discovered non-configurable container binding:

- FormEntry save/read/list/update source calls `_database.GetContainer("FormEntry")`.
- No source-discovered appsetting maps to the Forms/FormEntry container name.
- No container appsetting was set.

Health-source discovery:

- `Program.cs` defines dependency-light health at `/health` and `/api/health`.
- The local source returns `providerConfigured = false` and `providerStatus = "not_checked"` as fixed health response fields.
- Because the V2.8.32S gate requires `providerConfigured:true` when the field is present, the phase stopped after the live response remained false.

