# CUR-20-A04 resumption capsule

Status: `complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete` once both required A04 commits exist.

The canonical Atlas now lives at `deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/` and begins prospectively at the first commit that adds that path. It is not backdated. A01, A02, and A03 remain truthful historical records.

Current runtime carryforward:

- API production app: `app-pumpkin-api-prod-centralus-001`, GET `/health` 200 and `/health/ready` 200 on 2026-07-21.
- Admin production app: `app-pumpkin-admin-prod-centralus-001`, root GET 200.
- Admin isolated proof app: first GET timed out, immediate retry GET 200.
- App Service plan: `asp-pumpkin-api-prod-centralus-001`, Standard `S2`, capacity `2`.
- CRSTUR identity management active, seven staged flags active, tenant-admin transfer pilot held, tenant rename/migration/external provider held, final decision retain S2/two workers.
- Customer preservation from CRSTUR: tenants 4, accounts 6, memberships 8, contacts 4, form entries 12, pending reconciliation/security/synthetic/audit work 0.

Strict boundaries: no deploy/restart/scale/swap/appsettings/feature-flag/tenant/CMS/form/DNS/TLS/indexing/Airstrip/payment mutation without a fresh owner prompt. Treat upstream `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e` as observed, unfrozen, and not ingested.
