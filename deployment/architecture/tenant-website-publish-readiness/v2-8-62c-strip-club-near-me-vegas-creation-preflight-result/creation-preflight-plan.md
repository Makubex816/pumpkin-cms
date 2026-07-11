# Creation Preflight Plan

Status: plan superseded by the package fidelity gate; live creation blocked.

## Planned Objects

| Object | Candidate count | Live model/route plan |
| --- | ---: | --- |
| Tenant | 1 | `POST /api/admin/tenants` |
| TenantAdmin | 1 | `POST /api/admin/tenants/{tenantId}/tenant-admins` using secure handoff |
| Theme | 1 | `POST /api/admin/themes/{tenantId}` |
| Pages | 43 | `POST /api/admin/pages/{tenantId}`, all unpublished/noindex |
| Club details | 10 | typed content subset of the 43 Pages; no extra live model |
| Guide articles | 19 | typed content subset of the 43 Pages; no extra live model |
| FormDefinitions | 15 current candidates; exact accepted count pending | preserve 65 instance contracts before any future POST |
| MediaAssets | 302 retained hash candidates; exact count pending | no future POST until full dependency/alias adjudication and blob readback |
| ImportRun metadata | 1 | `POST /api/admin/{tenantId}/import-runs`; metadata only |
| PublishRun metadata | 1 | `POST /api/admin/{tenantId}/publish-runs`; prepared/no deploy |
| DomainBindings | 0 in creation | two desired hosts remain pending for a later domain phase |

The 43 source paths map to 43 unique Page-model slugs with no collisions. Twenty-nine are nested source routes and therefore require a proven runtime route map between the source path and flattened Page slug. `/service-areas` is a validator alias and is excluded. Three source routes are redirects and must retain redirect behavior. The old quarantine classification is withdrawn.

## Mutation Sequence

1. Recompile locally under the package fidelity contract; do not mutate the durable carryforward in place.
2. Repair two anchor targets and preserve three redirect routes.
3. Complete route, link, media, form-instance, interaction, catalog/detail, and blog/article ledgers.
4. Resolve all dormant-code and media owner-review items.
5. Build the trusted Page/Theme/interaction adapter with no generic fallback.
6. Prove all 43 routes at mobile, tablet, and desktop, including every control and form-instance behavior without live POST.
7. Obtain owner fidelity acceptance and the secure handoff.
8. Draft a separate controlled-creation approval with exact object/blob counts and mutation classes.

No live tenant, media, CMS, submit-key, deploy, DNS, custom domain, TLS, form POST, customer inquiry, or indexing action belongs to V2.8.62CR.
