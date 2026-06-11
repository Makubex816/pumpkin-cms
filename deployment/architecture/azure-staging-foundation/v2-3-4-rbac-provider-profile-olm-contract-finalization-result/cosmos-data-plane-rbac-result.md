# Cosmos Data-Plane RBAC Result

Cosmos DB NoSQL data-plane RBAC was assigned successfully.

| Field | Value |
| --- | --- |
| Account | `cosmos-pumpkincms-stg-olm01` |
| Database scope | `/dbs/pumpkincms-olm-staging` |
| Full scope | `/subscriptions/<redacted>/resourceGroups/rg-pumpkincms-stg-eastus-olm/providers/Microsoft.DocumentDB/databaseAccounts/cosmos-pumpkincms-stg-olm01/dbs/pumpkincms-olm-staging` |
| Role | `Cosmos DB Built-in Data Contributor` |
| Role definition GUID | `00000000-0000-0000-0000-000000000002` |

Assignments:

| Assignment ID | Principal | Principal ID |
| --- | --- | --- |
| `ff286a2b-2b67-47eb-b761-4c559df07bac` | operator Azure CLI session | redacted |
| `f5d12b8b-9840-42f3-be92-1c64ec06a524` | managed identity `id-pumpkincms-olm-stg` | `f9e8a811-cd4f-4afb-9f39-9f2fece7e5e2` |

Readback:

- `az cosmosdb sql role assignment list` confirmed both assignments at the staging database scope.
- No keys, `listKeys`, connection strings, SAS, tokens, or secret values were used.

