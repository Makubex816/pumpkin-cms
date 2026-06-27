# Health Endpoint Implementation Result

## Routes Added

| Method | Route | Endpoint name |
| --- | --- | --- |
| GET | `/api/health` | `GetApiHealth` |
| GET | `/health` | `GetRootHealth` |

## Response Shape

The health handler returns:

- `ok=true`
- `service="pumpkin-api"`
- assembly `version`
- ASP.NET environment label
- `providerConfigured=false`
- `providerStatus="not_checked"`
- `timestampUtc`

## Dependency Boundary

The health handler does not inject or call `IDatabaseService`, `DatabaseService`, `CosmosDataConnection`, or `MongoDataConnection`. It does not read `builder.Configuration`, connection strings, tokens, appsettings files, local settings files, `.env` files, Key Vault, or provider settings.

This makes the endpoint suitable for process-level runtime smoke tests. Provider health remains a separate protected-config-aware phase.

## Source Evidence

- Health handler: `apps/pumpkin-api/Program.cs:158`
- `/api/health`: `apps/pumpkin-api/Program.cs:169`
- `/health`: `apps/pumpkin-api/Program.cs:175`
- Scoped assertions: `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs:18`
