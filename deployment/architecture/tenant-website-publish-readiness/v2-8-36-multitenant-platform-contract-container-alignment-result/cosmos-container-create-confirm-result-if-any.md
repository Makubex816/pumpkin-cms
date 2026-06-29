# Cosmos Container Create Confirm Result

Containers created in V2.8.36:

| Container | Partition key | Throughput setting |
| --- | --- | --- |
| `Page` | `/tenantId` | No explicit throughput specified; Azure accepted create. |
| `MediaAsset` | `/tenantId` | No explicit throughput specified; Azure accepted create. |
| `PublishRun` | `/tenantId` | No explicit throughput specified; Azure accepted create. |
| `ImportRun` | `/tenantId` | No explicit throughput specified; Azure accepted create. |

Post-create confirmation showed all four containers present with `/tenantId`.

Not created:

- `Theme`
- `FormDefinition`
- `forms`

No documents were created, updated, or deleted.
