# Source Code Provider Review

## Reviewed Safe Source

- `apps/pumpkin-api/Services/DatabaseSettings.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Program.cs`
- `packages/pumpkin-ts-models/src/models/Tenant.ts`

## Provider Model

`DatabaseSettings` defines a `Database` configuration section with a provider default of `CosmosDb`. The provider-specific settings objects are `CosmosDb` and `MongoDb`.

`DatabaseService` routes the configured provider to:

- `CosmosDataConnection` when the provider is `cosmosdb`.
- `MongoDataConnection` when the provider is `mongodb`.

Unsupported provider names fail at service initialization.

## CMS/API Endpoint Safety Finding

The application does not expose a dedicated safe non-secret database-provider metadata endpoint.

Admin tenant endpoints can return tenant model fields that include `apiKey`, `apiKeyHash`, and `apiKeyMeta`, so raw tenant reads are not appropriate for provider discovery in this phase.

`/api/auth/verify` is GET-only but performs a user database read and returns user metadata. Phase 2F-12A used status-only/body-suppressed reachability handling instead of printing the response body.

## Interpretation

The source code proves the API is provider-routed and currently supports Cosmos DB and MongoDB. It does not prove which provider/source is active in production without runtime configuration, a safe provider metadata endpoint, or Azure/provider resource visibility.
