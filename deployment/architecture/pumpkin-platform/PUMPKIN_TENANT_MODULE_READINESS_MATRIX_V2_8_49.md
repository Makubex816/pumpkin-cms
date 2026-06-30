# Pumpkin Tenant Module Readiness Matrix V2.8.49

| Module | Ice Rink Rentals Status | Required For Next Tenant | Notes |
| --- | --- | --- | --- |
| SuperAdmin identity | Proven | Required | Production login form proof passed in V2.8.49. |
| Tenant record | Live | Required | Future tenant creation requires separate approval. |
| TenantAdmin users | Baseline required | Required | TenantAdmin creation/handoff should be tenant-scoped. |
| Pages | Live for Ice | Required | Writes remain separately approved. |
| MediaAsset | Proven in prior phases | Required | Preserve storage protection. |
| Themes | Admin UI CRUD proven | Required | Synthetic Theme cleanup passed. |
| FormDefinition | API and Admin UI CRUD proven | Required | Public read passed for UI-created definition. |
| FormEntry/contact | Contact gate closed | Required | Contact POST not in V2.8.49 scope. |
| ImportRun | Proven in prior phases | Required for migrations | Tenant target must be explicit. |
| PublishRun/static deploy | Proven in prior phases | Required for launch | DNS/indexing remain separate gates. |
| Static contact health | HTTP 200 | Required | Apex, www, and isolated health passed. |
| Monitoring/diagnostics | Hardened in prior phases | Required | Preserve alerts, diagnostics, and backups. |
| Per-tenant secrets | Secure handoff only | Required | No secrets in repo reports. |
| Cross-tenant isolation | Enforced by proof gates | Required | Other-tenant mutation is a hard stop. |
| Roller onboarding | Not created | Next approval candidate | Requires separate V2.8.50 scope. |
