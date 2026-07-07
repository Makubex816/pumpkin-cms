# V2.8.61J Starter Sandbox Decision Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `starter_app_local_runtime_existing_resource_sandbox_decision_no_deploy_no_airstrip_no_new_resource`.

## V2.8.61IA Carryforward

- V2.8.61IA is committed as `0c27a27e`.
- `apps/starter-app` remains the partner immutable tenant-site base.
- Starter `/admin` remains Option A: tenant-site-local admin only.
- Standalone `apps/admin` remains the platform/SuperAdmin control plane.
- Platform controls remain denied from starter `/admin`.
- Airstrip remained frozen.
- No deploy, new resource, DNS/custom-domain action, contact POST, form submit, or customer-facing POST occurred.

## Dependency And Lockfile Result

Initial state:

- `apps/starter-app/package.json` existed.
- No starter lockfile existed.
- No starter `node_modules` existed.
- No package lifecycle scripts were found in starter or local package dependencies.

Actions:

- Ran `npm install --package-lock-only --ignore-scripts` in `apps/starter-app`: pass.
- Ran `npm ci --ignore-scripts` in `apps/starter-app`: pass.
- Generated `apps/starter-app/package-lock.json`.
- Removed `apps/starter-app/node_modules` after proof.
- Removed generated `.next` after proof.

Notes:

- npm reported 5 audit findings: 1 moderate and 4 high. No `npm audit fix` was run because that would change dependency selections beyond this proof.
- `apps/starter-app/package-lock.json` is ignored by `.gitignore`; commit instructions use exact `git add -f`.

## Starter Local Runtime Proof

Passed:

- `npm run type-check`
- `npm run build`
- local built server GET proof on port `3003`

Local GET proof used placeholder non-secret settings:

- `NEXT_PUBLIC_PUMPKIN_API_URL=http://127.0.0.1:65535`
- `PUMPKIN_TENANT_ID=local-proof-tenant`
- `PUMPKIN_API_KEY=local-proof-placeholder-key`
- `PUMPKIN_SITE_NAME=Starter Local Proof`

Local route results:

- `/`: HTTP 200.
- `/admin/login`: HTTP 200.
- `/admin`: HTTP 200 after redirect to `/admin/login`.
- `/admin/forms`: HTTP 200 after redirect to `/admin/login`.
- `/admin/themes`: HTTP 200 after redirect to `/admin/login`.

Build warning:

- Next build completed successfully but warned that `packages/pumpkin-ts-models/dist/PageJsonConverter.js` imports `fs` through the package export trace. This is non-fatal for the proof and should be cleaned in a later package export hygiene phase.

## Compatibility Fixes

Starter source:

- FormBlock rendering now passes active `formBlock` override shape to `BlockViewRenderer`.
- FormBlock submit bridge now accepts `FormBlockSubmitPayload`.
- Contact fallback fields now include required `defaultValue`.
- FormDefinition editor now formats string/object options safely.
- Starter dashboard import fixed for `Gauge`.

Shared models:

- `FormDefinition` and `FormDefinitionField` now expose required starter-compatible defaults that validators already depend on.
- Default form definitions now include starter/admin compatibility fields.
- `Theme` now includes partner starter theme metadata fields used by the starter theme editor.

## Starter Admin Boundary Recheck

Pass.

Starter `/admin` still exposes only tenant-local dashboard, pages, page map, forms, and themes. The only matches for denied platform-control terms in starter source are inside the explicit denied-control allowlist file.

No Backup Manager, Package Intake, Domain Manager, users/admins platform management, hardcopy/recovery/resource controls, or cross-tenant operations were added to starter `/admin`.

## Existing Resource Sandbox Decision

Decision: no automatic Azure sandbox use in V2.8.61J.

Safest current proof target: local-only.

Future candidate if separate approval is granted:

1. `app-pumpkin-admin-isolated-centralus-001` in `rg-pumpkin-api-prod-centralus`
   - Existing non-Airstrip isolated Admin UI proof App Service.
   - Better technical fit for a Next server proof than SWA.
   - Risk: it currently serves isolated Admin UI proof, so replacing it would need explicit owner approval, backup/rollback package, and proof that standalone Admin UI production is unaffected.

2. `swa-ice-static-isolated-staging` in `rg-ice-static-staging`
   - Existing non-Airstrip isolated Static Web App proof resource.
   - Risk: currently tied to Ice isolated staging history and may not be a clean fit for full Next server/runtime API routes without a separate SWA/static adapter plan.

Rejected for starter sandbox:

- production resources;
- Airstrip resources;
- legacy/deferred static-contact function resources;
- any resource bound to public production custom domains.

## Runtime No-Regression

GET-only non-Airstrip runtime no-regression passed:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.

No Airstrip probes occurred.

## Security Boundary

No deploy, no new Azure resource, no live Azure mutation, no appsetting mutation, no DNS/custom-domain action, no Bluehost action, no indexing, no contact POST, no form submission, no customer-facing POST, no media upload/delete, no content/user/role/tenant/DomainBinding mutation, no keys/listKeys/SAS, no Key Vault query, and no files staged.

## Files Created Or Modified

Source/package:

- `apps/starter-app/package-lock.json`
- `apps/starter-app/src/app/admin/(workspace)/forms/_components/FormDefinitionEditor.tsx`
- `apps/starter-app/src/app/admin/(workspace)/page.tsx`
- `apps/starter-app/src/components/ContactFormBlock.tsx`
- `apps/starter-app/src/components/PageRenderer.tsx`
- `packages/pumpkin-ts-models/src/forms.ts`
- `packages/pumpkin-ts-models/src/models/Theme.ts`

Reports/docs:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61J_STARTER_SANDBOX_DECISION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-61j-starter-sandbox-decision-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_LOCAL_RUNTIME_PROOF_V2_8_61J.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXISTING_RESOURCE_SANDBOX_DECISION_V2_8_61J.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_DEPENDENCY_LOCKFILE_PLAN_V2_8_61J.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FREEZE_PRESERVATION_V2_8_61J.md`

Existing unrelated dirty files in the broader worktree were not reverted or staged.

## Commit Instructions

Use exact paths only:

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61J_STARTER_SANDBOX_DECISION_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-61j-starter-sandbox-decision-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_LOCAL_RUNTIME_PROOF_V2_8_61J.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_EXISTING_RESOURCE_SANDBOX_DECISION_V2_8_61J.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_DEPENDENCY_LOCKFILE_PLAN_V2_8_61J.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FREEZE_PRESERVATION_V2_8_61J.md" `
  "apps/starter-app/src/app/admin/(workspace)/forms/_components/FormDefinitionEditor.tsx" `
  "apps/starter-app/src/app/admin/(workspace)/page.tsx" `
  "apps/starter-app/src/components/ContactFormBlock.tsx" `
  "apps/starter-app/src/components/PageRenderer.tsx" `
  "packages/pumpkin-ts-models/src/forms.ts" `
  "packages/pumpkin-ts-models/src/models/Theme.ts"

git add -f -- "apps/starter-app/package-lock.json"

git commit -m "Prove starter local runtime and sandbox decision"
```
