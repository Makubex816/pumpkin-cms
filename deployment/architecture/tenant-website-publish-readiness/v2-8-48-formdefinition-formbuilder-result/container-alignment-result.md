# Container Alignment Result

Source-confirmed container:

- Name: `FormDefinition`
- Partition key: `/tenantId`
- Source path: `apps/pumpkin-api/Services/CosmosDataConnection.cs:590`

Live result:

- The container was missing at start.
- The container was created once.
- Readback confirmed `partitionKey: /tenantId`.

No Cosmos keys, listKeys, SAS, connection strings, direct document mutation, or protected config reads were used.
