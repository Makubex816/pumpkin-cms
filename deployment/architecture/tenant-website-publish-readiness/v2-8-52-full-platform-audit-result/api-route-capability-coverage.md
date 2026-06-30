# API Route Capability Coverage

| Area | Source Route Coverage | Proof Status |
| --- | --- | --- |
| Health | `/health`, `/api/health` | HTTP 200 in V2.8.52. |
| Public pages | `/api/pages/{tenantId}/{pageSlug}` | Proven in Page and PublishRun phases. |
| Public forms | `/api/forms/{tenantId}/entries` | Contact path proven through managed static API bridge; no V2.8.52 submit. |
| Public FormDefinition | `/api/forms/{tenantId}/definitions/{type}` | Proved in V2.8.48/V2.8.49. |
| Public sitemap | `/api/tenant/{tenantId}/sitemap` | Proved in Page/publish phases. |
| Public themes | `/api/themes/{tenantId}` and theme detail | Source present; theme lifecycle proven through admin and public read. |
| Auth | `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout` | Login/verify HTTP 200 in V2.8.52; logout not needed. |
| Admin tenants | list/read/create/update/regenerate/delete | Read-only list HTTP 200; creation not approved. |
| Admin pages | list/read/create/import/update/delete/rollback | Ice CRUD, import, rollback cleanup proofs closed. |
| Admin FormEntries | list/detail | Ice list HTTP 200 and count 4; status mutation not in V2.8.52. |
| Admin FormDefinitions | list/read/create/update/delete | Lifecycle and UI CRUD proved. |
| PublishRuns | list/read/create | Ice count 1; static integration proved. |
| ImportRuns | list/read/create | Ice count 1; import readback proved. |
| MediaAssets | list/read/create/upload/archive/restore/replace/delete | Lifecycle proof closed in V2.8.43; V2.8.52 read count 9. |
| Themes admin | list/active/read/create/update/delete | UI/API lifecycle proof closed. |
| Outbound links | read-only and write endpoint source present | Outside V2.8 tenant creation proof; keep separate. |
| Audit jobs/import intake/import executions/operator handoffs | read-only endpoint source present | Route/source present; not V2.8 live-workflow proven. |
