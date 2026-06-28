# FormEntry Source Confirmation

Source-confirmed container name:

`FormEntry`

Source-confirmed partition key path:

`/tenantId`

Evidence:

- `FormEntry` model stores tenant identity in JSON property `tenantId`.
- Public form submission route calls `SaveFormEntryAsync`.
- `CosmosDataConnection.SaveFormEntryAsync` writes to `_database.GetContainer("FormEntry")`.
- `CosmosDataConnection.SaveFormEntryAsync` creates records with `new PartitionKey(tenantId)`.
- `CosmosDataConnection.GetFormEntriesByTenantAsync` reads from `_database.GetContainer("FormEntry")`.
- `CosmosDataConnection.GetFormEntriesByTenantAsync` queries with `PartitionKey = new PartitionKey(tenantId)`.
- `CosmosDataConnection.GetFormEntryAsync` reads by id with `new PartitionKey(tenantId)`.

Source conflict: none.
