# CMS Feature Readiness Matrix

| Workflow | Status | Evidence | Blocker / next step |
| --- | --- | --- | --- |
| Public contact capture | Proven live | V2.8.33B/V2.8.34A traces plus V2.8.35 GET checks | Routine monitoring |
| Static contact bridge | Proven live | SWA appsettings present, health 200, compat tests passed | None for contact lane |
| Admin UI shell | Proven local | `apps/admin` source and type-check passed | Deploy dedicated Admin UI |
| Admin API auth/readback | Prior proven | V2.8.34A readback proof | Re-run bounded proof before Admin deploy |
| Tenant/key rotation | Proven live for contact lane | V2.8.34A key rotation/readback | Broader Tenant UI validation pending |
| Page editor | Source-ready, live-blocked | Admin routes/API endpoints present | Cosmos container naming mismatch |
| Page publish/rollback | Source-ready, live-blocked | API endpoints and Admin routes present | Container mismatch; no deploy/write approval |
| Media management | Source-ready, live-blocked | Blob media live; Admin/API media routes present | `MediaAsset` source container not found; storage env not fully validated |
| Import/export | Source/local prototype | Admin routes and import run endpoints present | `ImportRun` source container not found; live validation pending |
| Theme management | Source-ready, live-blocked | Admin/API theme routes present | `Theme` source container not found |
| User management | Partially proven | `User` container present; prior auth proof | Current login proof not revalidated |
| Outbound link manager | Staging/prototype | Staging OLM Azure resources and source routes exist | Not production Pumpkin CMS live |
| Audit jobs | Source/prototype | Read-only API/Admin code present | Runtime QA lane separate |
| Operator handoffs | Source/prototype | Admin and API source present | Runtime QA lane separate |
| Backup/restore | Partially ready | Prior backup packages and Cosmos continuous backup | Production operational hardening needed |
