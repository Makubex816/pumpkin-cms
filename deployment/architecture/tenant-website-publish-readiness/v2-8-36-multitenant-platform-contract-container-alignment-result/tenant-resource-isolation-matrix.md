# Tenant Resource Isolation Matrix

| Area | Shared or tenant-specific | Isolation mechanism | V2.8.36 status |
| --- | --- | --- | --- |
| Pumpkin API | Shared | Route tenant ID, JWT tenant claim, API key validation | Source-ready |
| Cosmos account/database | Shared | Tenant-partitioned containers | Active containers aligned |
| Tenant records | Shared container | `Tenant` partition key `/tenantId` | Present |
| User records | Shared container | `User` partition key `/tenantId` | Present |
| Page records | Shared container | `Page` partition key `/tenantId` | Created |
| Media metadata | Shared container | `MediaAsset` partition key `/tenantId` | Created |
| Publish history | Shared container | `PublishRun` partition key `/tenantId` | Created |
| Import history | Shared container | `ImportRun` partition key `/tenantId` | Created |
| Form submissions | Shared container | `FormEntry` partition key `/tenantId` | No-regression only |
| Static Ice site | Tenant-specific runtime | Static host plus tenant contact/API binding | Live |
| Media blobs | Shared storage resource with tenant prefix | Account/container/prefix mapping | Ice present |
| Admin UI | Shared admin surface | Current tenant context and JWT role/tenant enforcement | Source-only |
| Roller public site | Future tenant runtime | Planned tenant/site config | Not live-ready |
