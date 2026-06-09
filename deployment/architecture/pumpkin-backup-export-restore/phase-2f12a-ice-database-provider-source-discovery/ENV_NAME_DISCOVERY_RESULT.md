# Env Name Discovery Result

Presence-only checks were run in the Codex terminal process. Values were not printed.

| Name | Presence |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |
| `ICE_RINK_RENTALS_TENANT_ID` | MISSING |
| `ICE_RINK_RENTALS_API_KEY` | MISSING |
| `PUMPKIN_DATABASE_PROVIDER` | MISSING |
| `PUMPKIN_COSMOS_ACCOUNT_NAME` | MISSING |
| `PUMPKIN_COSMOS_RESOURCE_GROUP` | MISSING |
| `PUMPKIN_COSMOS_DATABASE_NAME` | MISSING |
| `PUMPKIN_COSMOS_CONTAINER_PREFIX` | MISSING |
| `PUMPKIN_COSMOS_AUTH_MODE` | MISSING |
| `PUMPKIN_TENANT_ID` | MISSING |
| `PUMPKIN_TENANT_SLUG` | MISSING |
| `PUMPKIN_SITE_ID` | MISSING |
| `PUMPKIN_SITE_SLUG` | MISSING |
| `Database__Provider` | MISSING |
| `Database__CosmosDb__ConnectionString` | MISSING |
| `Database__CosmosDb__DatabaseName` | MISSING |
| `Database__CosmosDb__PreferredRegions` | MISSING |
| `Database__MongoDb__ConnectionString` | MISSING |
| `Database__MongoDb__DatabaseName` | MISSING |
| `COSMOS_CONNECTION_STRING` | MISSING |
| `MONGODB_URI` | MISSING |
| `AZURE_SUBSCRIPTION_ID` | MISSING |

## Interpretation

The session has enough env to test API reachability, but it does not have provider/source/tenant-scope hints needed to identify the live database provider or Cosmos account.
