# FormEntry Persistence Provider Plan

## Intended provider

| Field | Value |
| --- | --- |
| Provider | Cosmos DB |
| Account | `cosmos-pumpkin-prod-eastus` |
| Resource group | `rg-ice-production-cosmos` |
| Database | `pumpkin-prod-cms` |
| FormEntry container | `forms` |
| Partition key | `/tenantKey` |

## Source binding

`DatabaseService` selects provider by `Database__Provider`. For this lane the required value is:

```text
Database__Provider=CosmosDb
```

The source currently expects Cosmos connection material through configuration. Protected connection material must be supplied by an approved App Service setting or Key Vault reference under the existing setting name:

```text
Database__CosmosDb__ConnectionString
```

## Write/read topology

```text
Static contact
  -> POST /api/forms/ice-rink-rentals/entries
  -> DatabaseService.SaveFormEntryAsync
  -> CosmosDataConnection.SaveFormEntryAsync
  -> forms container
  -> Admin GET /api/admin/ice-rink-rentals/form-entries
  -> CosmosDataConnection.GetFormEntriesByTenantAsync
```

## Provider proof gates

1. API runtime starts with `Database__Provider=CosmosDb`.
2. Authenticated provider metadata returns production profile values.
3. Read-only Admin form-entry list works against the same provider.
4. Isolated controlled contact write creates one `FormEntry`.
5. Admin returns the same id.
6. Backup/export proof includes the created record or the operator-approved equivalent evidence.
