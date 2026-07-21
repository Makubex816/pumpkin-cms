# UP-30 clean-room qualify frozen upstream prompt

TASK ID: UP-30 — Clean-Room Qualify Frozen Upstream

Inputs:
- Frozen upstream repository: https://github.com/SDI-AI/pumpkin-cms.git
- Selected ref: refs/heads/main
- Frozen commit: fda4611f6ca5a6206e3e8d6254e3e41c3b50618e
- Frozen tree: 08f1ecdb73c846564c2a0f3de889b66775e8ae5c
- Bundle SHA-256: 884ecef6e8df17a0afff0a435477893a5c8907058076663e2079a41d687743a9
- Source archive SHA-256: 3dc0b0775a9b50997b3f9f7f1f37b23ac62d2fe0e25fd0729bb91dfc0262ae1f
- Source manifest SHA-256: 3c017e902ad75c6658ad6f10978b815f03ff653b21af9a1980e4120a28ac023c
- Qualification state: FROZEN_NOT_YET_CLEAN_ROOM_QUALIFIED

Use the immutable source archive or bundle from `program-management/upstream-intake/UP-20-A02/freeze/`. Do not refetch moving upstream as source authority during UP-30 except to verify that the frozen commit still exists.

Required qualification gaps:
- No completed GitHub status/check evidence was attached to the frozen commit.
- No workflow definitions were observed in `.github/workflows`.
- Build/test commands must be derived from package/project files in the frozen source.
- Generated .NET and TypeScript model outputs must be reproduced or diff-verified.
- License and NOTICE evidence is mandatory input.

Discovered build/test inputs:
- apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj
- apps/pumpkin-api/pumpkin-api.csproj
- apps/pumpkin-api/pumpkin-api.sln
- apps/pumpkin-net-models/pumpkin-net-models.csproj
- apps/starter-app/package.json
- global.json
- package-lock.json
- packages/pumpkin-block-views/package.json
- packages/pumpkin-ts-models/package-lock.json
- packages/pumpkin-ts-models/package.json

Downstream preservation boundaries:
- immutable tenantUid architecture
- mutable tenant-slug foundation
- global UserAccount and TenantMembership
- TenantAdmin and SuperAdmin management
- password and session management
- tenant contact and form-notification settings
- tenant-scoped FormEntry persistence
- TenantAdmin Forms inbox
- cross-tenant isolation
- Party Pros runtime, catalog, blog, cart, fixtures, and forms
- Vegas pages, media, redirects, forms, domains, TLS, and noindex
- Ice runtime and forms
- Airstrip public-runtime freeze
- custom-host routing
- runtime-key isolation
- package-fidelity compiler
- preview fixtures
- dependency-aware App Service readiness
- current S2/two-worker operating state
- backup and restore standards
- active Atlas Snapshot Library and working memory

Not authorized in UP-30 unless separately granted: downstream merge, deployment, Azure mutation, tenant/user/form write, Airstrip public-runtime request, DNS/TLS/indexing action, payment integration, or capacity change.
