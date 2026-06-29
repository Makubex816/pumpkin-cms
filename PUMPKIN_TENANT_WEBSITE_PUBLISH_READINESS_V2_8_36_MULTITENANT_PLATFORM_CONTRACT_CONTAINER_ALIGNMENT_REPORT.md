# V2.8.36 Multi-Tenant Platform Contract + Container Alignment Report

Date: 2026-06-29

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `multitenant_platform_contract_active_scope_container_alignment_no_deploy_no_content_mutation`.

Status: completed with active-scope Cosmos container alignment and documentation.

## Executive Result

V2.8.36 made multi-tenancy a durable Pumpkin platform contract, reviewed the operator-provided endpoint contract against source, aligned active source-required Cosmos containers, and kept Themes/Form Definitions out of active scope.

Only the approved live mutation occurred: `Page`, `MediaAsset`, `PublishRun`, and `ImportRun` containers were created in `pumpkin-prod-cms` with partition key `/tenantId`. No tenant/content/media/import/publish documents were written.

## V2.8.35 Carryforward

- Contact gate remains closed.
- Key rotation remains closed_success.
- Pumpkin API `/health` and `/api/health` are live and return 200.
- `providerConfigured:false` remains known hardcoded source health behavior.
- Ice contact production and isolated surfaces remain live.
- Media remains hosted at `iceskatingmedia` / `ice-rink-rentals-media` / `ice-rink-rentals/assets/`.
- Admin UI remains source-present but not deployed live.
- Backup/monitoring gaps remain open and were not mutated.

## Endpoint Contract Review

No repo-local `API_ENDPOINTS.md` was found, so V2.8.36 used the embedded operator-provided contract. Active endpoints mapped to source:

- public pages and sitemap;
- Admin auth and tenant routes;
- Admin pages;
- content hierarchy;
- media assets;
- publish runs;
- import runs.

FormEntry Admin route naming differs between embedded no-regression text and source, but FormEntry was not active implementation scope. Theme and Form Definition endpoints were explicitly excluded.

## Multi-Tenant Contract

Created:

- `deployment/architecture/pumpkin-platform/PUMPKIN_MULTI_TENANT_PLATFORM_CONTRACT.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_ACTIVE_ENDPOINT_CONTRACT_V2_8_36.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_FUTURE_PHASE_MULTITENANCY_GATE.md`

The contract requires tenant-owned records to carry `tenantId`, active Cosmos containers to partition by `/tenantId`, Admin access to enforce JWT tenant/role context, public endpoints to enforce tenant API key context, and future phases to pass a multi-tenancy gate.

## Active Scope And Exclusions

Active:

- Tenants, Users, Pages, MediaAsset, PublishRun, ImportRun.
- Public pages and sitemap.
- Admin pages and content hierarchy.
- Admin RBAC and tenant scope.
- Admin UI page/content readiness.
- Media tenant isolation.
- Roller readiness analysis.

Excluded:

- Themes.
- Form Definitions.
- Theme/FormDefinition/forms container creation.
- New form submission validation.
- Contact POSTs.

FormEntry was recorded only as prior no-regression evidence.

## Container Alignment

Before V2.8.36, live Cosmos had singular `Tenant`, `User`, and `FormEntry`, plus lower/plural legacy CMS containers. Source required singular `Page`, `MediaAsset`, `PublishRun`, and `ImportRun`.

Created in V2.8.36:

| Container | Partition key |
| --- | --- |
| `Page` | `/tenantId` |
| `MediaAsset` | `/tenantId` |
| `PublishRun` | `/tenantId` |
| `ImportRun` | `/tenantId` |

Not created:

- `Theme`
- `FormDefinition`
- `forms`

No lower/plural containers were deleted or migrated.

## RBAC And Tenant Scope

Source JWT claims include role and `tenantId`. Admin page, tenant, content hierarchy, FormEntry, media, publish-run, and import-run routes enforce own-tenant access unless the caller is SuperAdmin. Public page/sitemap routes validate tenant API key against the route tenant.

Care point: internal helper methods that can operate across all tenants must remain SuperAdmin/system-only in future phases.

## Endpoint Readiness

Public and Admin source contracts are present. Active container dependencies are now aligned. Live authenticated Admin/API-key proof was deferred because the approved hard-copy hash matched but did not expose parseable Admin/API values for this phase.

Read-only public proof:

- Pumpkin API `/health`: 200.
- Pumpkin API `/api/health`: 200.
- Production `/api/static-contact-health`: 200.
- Production `/contact`: 200, uses `/api/static-contact`, not `/api/contact`.
- Isolated `/api/static-contact-health`: 200.
- Isolated `/contact`: 200, uses `/api/static-contact`, not `/api/contact`.

## Hardcoded Tenant Audit

Hardcoded Ice/Roller values exist in static deployment docs/scripts, Admin preview host maps, validators, and fixtures. This is acceptable for current profiles and tests, but future scale should move preview/static tenant profile behavior toward a registry-driven model.

## Media Isolation

Ice media is tenant-separated by live storage account/container/prefix mapping. `MediaAsset` metadata is now backed by a source-aligned `/tenantId` Cosmos container. Future tenants need explicit media allocation before upload or publish.

## Roller Readiness

Roller is modeled in source/docs but not live-ready. Required before activation: tenant/key proof, media binding, static app/runtime binding, read-only Admin proof, content/import dry-run, and backup/monitoring review.

## Admin UI Implications

Admin UI remains local-only, with no live resource found. Source uses selected/current tenant context for pages, import/export, import history, and media calls. Type-check passed. A separate approval is required for Admin UI deployment or live read-only proof.

## Backup/Monitoring Implications

Shared multi-tenant expansion raises the priority of App Service backup strategy, diagnostics, tenant-aware logs/alerts, media soft delete/versioning/change feed, and tenant-scoped restore runbooks. No backup or monitoring setting was changed.

## Validation

Passed:

- Subscription lock.
- Source route/tenant scope review.
- Cosmos pre/post inventory.
- Active-scope container creation confirmation.
- Public health/contact GETs.
- Admin type-check.
- Static contact compatibility tests.
- Required file existence check.
- Result manifest JSON parse.
- Git diff whitespace check.
- Trailing whitespace scan.
- Secret-shaped scan.
- Disallowed-command scan.
- No-staged-files check.

Deferred:

- Authenticated Admin API GET proof.
- Public sitemap proof with tenant API key.
- Admin UI live proof.

## Result Package

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-36-multitenant-platform-contract-container-alignment-result/`

Required files and durable docs were created.

## Security And Mutation Boundary

- No secret value was printed or written.
- No deploy occurred.
- No contact POST occurred.
- No appsetting mutation occurred.
- No DNS/custom-domain mutation occurred.
- No indexing occurred.
- No tenant/content/media/import/publish document writes occurred.
- No Theme/FormDefinition/forms container was created.
- No protected config file was read.
- No files were staged.

## Next Approval

The exact next approval text is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-36-multitenant-platform-contract-container-alignment-result/next-phase-prompt.md`
