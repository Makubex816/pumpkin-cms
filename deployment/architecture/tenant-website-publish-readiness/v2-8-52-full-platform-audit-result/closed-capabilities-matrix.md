# Closed Capabilities Matrix

| Capability | Current Status | Evidence |
| --- | --- | --- |
| Public Ice site | Live/proven | Apex and www `/`, `/contact`, `/service-areas` returned HTTP 200 in V2.8.52. |
| Static contact managed API | Live/proven | Apex, www, and isolated `/api/static-contact-health` returned HTTP 200. |
| Contact POST/FormEntry path | Closed for Ice | V2.8.33B/V2.8.34A production POST/readback closed contact gate; no V2.8.52 POST was sent. |
| Pumpkin API health | Live/proven | `/health` and `/api/health` returned HTTP 200. |
| Admin UI production | Live/proven | `/`, `/login`, `/dashboard` returned HTTP 200. |
| SuperAdmin | Live/proven | Read-only login/verify/tenant list returned HTTP 200 with role `SuperAdmin`. |
| TenantAdmin | Proven | Earlier TenantAdmin proofs passed; current SuperAdmin audit confirms Ice tenant and counts. |
| Tenant model | Live/proven | `ice-rink-rentals` active; secondary absent. |
| Pages | Live/proven | Ice has 3 pages; Page CRUD and browser workflows proved in V2.8.38/V2.8.39A. |
| MediaAsset/Azure Blob | Live/proven | Ice has 9 MediaAssets; lifecycle proof closed in V2.8.43. |
| Themes | Live/proven | Ice has 1 Theme; API and Admin UI CRUD proved. |
| FormDefinition/Form Builder | Live/proven | Ice has 1 FormDefinition; API and Admin UI CRUD proved. |
| FormEntry/contact | Live/proven for contact | Ice has 4 FormEntries visible read-only. |
| Non-contact FormEntry submit | Not required/proven | V2.8.48/V2.8.49 did not send synthetic non-contact submissions. |
| ImportRun/export-import | Live/proven | Ice has 1 ImportRun; 409 repaired in V2.8.43A. |
| PublishRun/static integration | Live/proven | Ice has 1 PublishRun; static integration proved in V2.8.44. |
| Monitoring/diagnostics/alerts | Applied/preserved | Observability group has workspace, action group, and six metric alerts. |
| Tenant onboarding package contract | Live in repo/proven | V1 spec, schemas, examples, and validator exist; Ice and secondary packages validate. |
| Secondary package readiness | Package-ready only | `strip-club-near-me-vegas` package validates; tenant does not exist live. |
