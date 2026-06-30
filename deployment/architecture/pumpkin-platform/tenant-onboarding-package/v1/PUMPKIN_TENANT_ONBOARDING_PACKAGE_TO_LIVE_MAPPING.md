# Package To Live Mapping

| Package Module | Live Surface | Write Approval Required |
| --- | --- | --- |
| tenant | Pumpkin API `Tenant` record | Yes |
| users | Pumpkin API `User` records | Yes |
| pages | Pumpkin API `Page` records | Yes |
| media | Pumpkin API `MediaAsset` records and blob storage | Yes |
| theme | Pumpkin API `Theme` records and Admin UI Theme workflow | Yes |
| forms | Pumpkin API `FormDefinition` records and Admin UI Form Builder | Yes |
| contact | Static contact runtime and FormEntry readback | Yes for submissions |
| importExport | ImportRun/export tooling | Yes for imports |
| publish | PublishRun and static output | Yes |
| monitoring | Diagnostics, alerts, runbooks | Yes for mutations |
| validation | Local and GET-only checks | No live write |

Live execution must follow the current phase approval. A valid package is not permission to mutate production.
