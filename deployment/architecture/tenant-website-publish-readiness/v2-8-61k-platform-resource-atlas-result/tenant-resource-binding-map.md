# Tenant Resource Binding Map

| tenantOrSystem | currentBinding | resources | status | notes |
| --- | --- | --- | --- | --- |
| ice-rink-rentals | production public website and CMS tenant | `swa-ice-static-staging`; `cosmos-pumpkin-prod-eastus`; `iceskatingmedia/ice-rink-rentals-media`; Pumpkin API; Admin UI | live | Apex and www custom domains Ready on Ice SWA. |
| airstrip-club-las-vegas | production default-host tenant and frozen custom-domain lane | `app-airstrip-prod-centralus-001`; `app-airstrip-preview-isolated-centralus-001`; `iceskatingmedia/airstrip-club-las-vegas-media`; production Cosmos tenant records per V2.8.61G inventory | frozen | No V2.8.61K Airstrip route probe, DNS mutation, or record mutation. |
| Pumpkin platform | API/Admin/control plane | `app-pumpkin-api-prod-centralus-001`; `app-pumpkin-admin-prod-centralus-001`; `app-pumpkin-admin-isolated-centralus-001`; `asp-pumpkin-api-prod-centralus-001` | live | Standalone Admin UI remains SuperAdmin/platform control plane. |
| starter-app | local future tenant starter baseline | `apps/starter-app` repo source only | local_only | Not deployed. `/admin` is tenant-local only. |
| outbound-link-manager staging | older staging/proof system | `rg-pumpkincms-stg-eastus-olm` resources | cleanup_candidate_needs_dependency_proof | Do not delete until dependency proof is approved and completed. |

V2.8.61G repo-safe inventory stated:

- Tenants found: `ice-rink-rentals`, `airstrip-club-las-vegas`.
- Admin users found: 3.
- DomainBinding records found: 1.

Raw tenant secrets, API keys, passwords, and appsetting values are not included in this map.
