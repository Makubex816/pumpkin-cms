# V2.8.61IA Starter Admin Boundary Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `starter_app_tenant_local_admin_boundary_platform_extension_no_deploy_no_airstrip_no_mutation`.

## V2.8.61I Carryforward

- V2.8.61I is committed as `52fa9209`.
- `apps/starter-app/` was imported as the additive immutable partner starter baseline.
- Starter form/admin pieces were adapted to active repo contracts.
- `pumpkin-ts-models` and `FormBlockView` compatibility bridges were carried forward.
- Starter full build remains deferred because no starter lockfile or `node_modules` exists.
- Airstrip remained frozen.
- No deploy, new resource, DNS/custom-domain action, contact POST, form submit, or customer-facing POST occurred.

## Starter Admin Classification

Decision: Option A.

`apps/starter-app` `/admin` is classified as a tenant-site-local admin surface. It is not the platform/SuperAdmin control plane.

The standalone Admin UI in `apps/admin` remains the platform/SuperAdmin source of truth.

## Source Boundary Result

Added `apps/starter-app/src/lib/starter-admin-boundary.ts` with:

- classification `tenant_site_local_admin_surface`;
- platform source of truth `standalone_pumpkin_admin_ui`;
- allowed starter workflows: dashboard, pages, page map, forms, themes;
- denied platform controls: Backup Manager, Package Intake, Domain Manager, users/admins platform management, hardcopy/recovery, resource management, cross-tenant controls.

Updated starter shell/dashboard to use the allowlist and label the surface as tenant-local.

## Conflict Review

Starter `/admin` routes expose only:

- `/admin`
- `/admin/pages`
- `/admin/page-map`
- `/admin/forms`
- `/admin/themes`

No starter route exposes Backup Manager, Package Intake, Domain Manager, users/admins platform management, hardcopy/recovery/resource controls, or cross-tenant controls.

SuperAdmin login compatibility remains an authentication capability only; starter `/admin` exposes tenant-local workflows only.

## Extension Compatibility

Forms/FormBlock:

- Starter public rendering fetches FormDefinition data and passes definitions into `BlockViewRenderer`.
- Starter contact/form submit routes align with active FormDefinition/FormEntry route shapes.
- V2.8.61I option compatibility remains preserved.

Package Compiler:

- Tenant package V1 contains pages, theme, forms, domains, media manifest, validation routes, and publish metadata.
- Starter can consume pages/theme/forms conceptually through active Pumpkin API contracts.
- DomainBinding and media are read-only/runtime context for starter until a later sandbox proof adds explicit adapters.

Downstream systems preserved:

- DomainBinding
- media/blob conventions
- Package Compiler output
- responsive guardrails
- tenant package V1 contract
- FormDefinition/FormEntry compatibility
- SuperAdmin/TenantAdmin boundary

## Local Proof

Passed:

- starter JSON parse;
- `node --check` for literal `.js`, `.mjs`, and `.cjs` starter files;
- starter platform-control scan found only the explicit denied-control list.

Deferred:

- starter dependency install, type-check, and build. `apps/starter-app` has no lockfile and dependency install is approved only when a safe lockfile path exists.

## Runtime Proof

GET-only non-Airstrip runtime no-regression passed:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.

No Airstrip probes occurred.

## Security Boundary

No deploy, no new resource, no live Azure mutation, no appsetting mutation, no DNS/custom-domain action, no contact POST, no form submission, no customer-facing POST, no media upload/delete, no tenant/content/user/role/DomainBinding mutation, no storage keys/listKeys/SAS, no Key Vault query, no protected config read, and no staging occurred.

## Files Created Or Modified

Source/docs:

- `apps/starter-app/src/lib/starter-admin-boundary.ts`
- `apps/starter-app/src/components/admin/AdminShell.tsx`
- `apps/starter-app/src/app/admin/(workspace)/page.tsx`
- `apps/starter-app/README.md`
- `apps/starter-app/PUMPKIN_ACTIVE_REPO_ADAPTER_NOTES.md`

Reports/docs:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61IA_STARTER_ADMIN_BOUNDARY_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-61ia-starter-admin-boundary-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_TENANT_LOCAL_ADMIN_V2_8_61IA.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_PLATFORM_EXTENSION_V2_8_61IA.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_PACKAGE_COMPILER_COMPATIBILITY_V2_8_61IA.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_FORMS_FORMBLOCK_COMPATIBILITY_V2_8_61IA.md`

Existing unrelated dirty files in the broader worktree were not reverted or staged.

## Commit Instructions

Use exact paths only:

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61IA_STARTER_ADMIN_BOUNDARY_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-61ia-starter-admin-boundary-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_TENANT_LOCAL_ADMIN_V2_8_61IA.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_PLATFORM_EXTENSION_V2_8_61IA.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_PACKAGE_COMPILER_COMPATIBILITY_V2_8_61IA.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_FORMS_FORMBLOCK_COMPATIBILITY_V2_8_61IA.md" `
  "apps/starter-app/src/lib/starter-admin-boundary.ts" `
  "apps/starter-app/src/components/admin/AdminShell.tsx" `
  "apps/starter-app/src/app/admin/(workspace)/page.tsx" `
  "apps/starter-app/README.md" `
  "apps/starter-app/PUMPKIN_ACTIVE_REPO_ADAPTER_NOTES.md"

git commit -m "Classify starter admin tenant-local boundary"
```
