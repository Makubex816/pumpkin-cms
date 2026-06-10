# Pumpkin Outbound Link Manager Phase 2H-7 API Admin Implementation Planning Refresh Report

Status: complete

Phase 2H-7 created the production-grade API/Admin implementation planning refresh for the tenant-scoped Outbound Link Manager.

Foundation used:

- Phase 2H-3 local scanner and registry foundation.
- Phase 2H-4 local persistence, lifecycle, policy, scan-run, and audit foundation.
- Phase 2H-5 rendering-control prototype.
- Phase 2H-6 Backup Center, onboarding, tenant bundle, domain review, and restore validation integration.
- Phase 2H-6A controlled 70 / 100 milestone repo remediation result.

Planning package:

- `deployment/architecture/outbound-link-manager/phase-2h7-api-admin-implementation-planning-refresh/`

What was planned:

- Future Pumpkin API endpoint contracts for outbound links, instances, policies, scan runs, audit, and bulk actions.
- API service boundaries for endpoints, application services, domain services, providers, validators, audit, bulk actions, scans, rendering decisions, and integrations.
- Request/response model contracts, list pagination, error model, and write-gate requirements.
- Database migration and provider strategy for local JSON, in-memory tests, and future Cosmos provider work.
- Admin dashboard screens, routes, components, workflows, read-only states, and future write-approved states.
- Permission matrix, audit logging, bulk-action preview/execute model, scan-run modes, rendering integration gates, Backup Center handoff, onboarding handoff, tenant bundle handoff, local-first/live-readonly behavior, security boundaries, tests, risks, and rollout batches.

Readiness:

| Item | Status |
| --- | --- |
| Phase 2H-7 planning refresh | complete |
| Ready for Phase 2H-8 API contract/local service foundation | yes |
| API/Admin implementation performed | no |
| Database migration performed | no |
| CMS writes performed | no |
| External link crawling performed | no |
| Live pages affected | no |

Recommended next step:

- Phase 2H-8 API contract and local service foundation only.

No implementation, database migration, CMS writes, Admin UI/API code changes, external link crawling, protected config reads, Azure/CMS/API mutations, deployment, Search Console/indexing, live-page publication, or repo cleanup occurred.

