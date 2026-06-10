# Pumpkin Outbound Link Manager Architecture Report

Status: complete

Phase 2H-1 created the Outbound Link Manager architecture/design package at `deployment/architecture/outbound-link-manager/`.

What was designed:

- tenant-scoped outbound link registry;
- outbound link instance tracking;
- local-first scanner/discovery model;
- deterministic rendering-control model;
- Admin UI screen plan;
- API endpoint plan;
- permission and tenant isolation model;
- audit logging model;
- bulk action model;
- Backup Center backup/restore integration;
- onboarding import integration;
- tenant website bundle integration;
- local-first and future live-readonly behavior;
- migration/backfill plan;
- validation and test plan;
- operational readiness criteria;
- implementation roadmap;
- schema drafts and safe templates.

Why this follows Backup Generator validation:

Phase 2F completed standard backup generation, validation, restore-plan dry-runs, resource registry integration, and operator signoff readiness. Outbound Link Manager now builds on that safety layer so outbound link governance is backup-aware and restore-aware before implementation begins.

Domain model summary:

- `outbound_links` stores canonical tenant/site URLs.
- `outbound_link_instances` stores every placement.
- `outbound_link_policies` stores tenant/site rendering and review policy.
- `outbound_link_scan_runs` stores discovery summaries.
- `outbound_link_audit_logs` stores immutable governance history.

Scanner, rendering, Admin, and API summary:

- Scanner reads local content, import packages, backup bundles, and tenant bundles.
- Scanner does not crawl external links in this phase.
- Renderer checks global link status and instance status before emitting anchors.
- Admin design includes dashboard, detail, instances, domains, bulk actions, scan history, audit log, tenant policy, and review queue.
- API plan separates read endpoints from future write endpoints that require later approval.

Integration summary:

- Standard backups should include outbound link registry, instances, policies, scan summaries, and audit summaries.
- Restore validation should compare link count, instance count, domain count, disabled state, and policy state.
- Onboarding import packages should include expected outbound links, policy, external domain review, and validation reports.
- Tenant website bundles should include outbound link governance files under `tenants/{tenantKey}/sites/{siteKey}/outbound-links/`.

Readiness classification:

| Item | Status |
| --- | --- |
| Phase 2F Backup Generator QA/signoff | complete |
| Phase 2H-1 Outbound Link Manager architecture | yes |
| Implementation performed | no |
| Database migration performed | no |
| CMS writes performed | no |
| External link crawling performed | no |
| Backup integration designed | yes |
| Onboarding integration designed | yes |
| Ready for 2H-2 implementation planning | yes |

No implementation, database migration, CMS writes, external link crawling, protected config reads, Azure/CMS/API mutations, deployment, Search Console/indexing, or live-page publication occurred.
