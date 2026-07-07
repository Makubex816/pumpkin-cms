# V2.8.61H External Pumpkin Main Refresh Audit Report

Status: completed read-only audit, no mutation.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: external_pumpkin_main_refresh_api_starter_forms_admin_impact_audit_no_mutation.

Completed at: 2026-07-07T16:25:48-04:00.

## Why Airstrip Cutover Is Paused

The owner cancelled the V2.8.62 Airstrip custom-domain secure handoff after the partner reported that upstream Pumpkin main had just been merged with API updates, a starter app, embedded `/admin`, custom contact forms, and a form designer. The pause is appropriate: the upstream merge changes API, form, admin, model, and frontend-template surfaces that overlap with current Pumpkin production work.

The pause is not a production failure. Airstrip remains ready on the production default host, but custom-domain cutover should resume only after the owner chooses either:

- continue Airstrip custom-domain cutover on the current proven platform without upstream integration; or
- start a separate staged upstream integration phase before any further cutover work.

## Repo Fetch And Pin Summary

| Repo | Role | Ref | Commit | Commit date | Subject |
| --- | --- | --- | --- | --- | --- |
| SDI-AI/pumpkin-cms | partner upstream | `origin/main` | `565a8afd669a42224a9d15759f7060faa375d000` | `2026-07-07T16:05:11-04:00` | `Merge pull request #1 from SDI-AI/feature/starter-theme-controls` |
| Makubex816/pumpkin-cms | owner main comparison | `origin/main` | `64156a3015943f08bc89cadb2caae910d5cadf4f` | `2026-02-26T09:59:59-05:00` | `SiteMap` |
| active working repo | current branch | `HEAD` | `7664e030325ea3ed1928f7e875cbb4161e0511d6` | `2026-07-07T16:12:56-04:00` | `Add V2.8.61G pre-domain hardcopy report` |

External clones are outside the active repo:

- `C:\Users\User\Desktop\PumpkinCMS\external-reference\SDI-AI-pumpkin-cms`
- `C:\Users\User\Desktop\PumpkinCMS\external-reference\Makubex816-pumpkin-cms`

## Partner Transcript Impact Summary

The transcript is confirmed by source:

- "just merged to main": upstream main is a merge commit with two parents.
- "for the api update": `apps/pumpkin-api/Program.cs`, `PumpkinManager.cs`, data connection services, and API tests changed heavily.
- "added starter-app": a new real app exists at `apps/starter-app`; it is not just `apps/sample-app`.
- "there are many API updates": public forms, admin forms, users, theme, and page routes are expanded.
- "starter app has /admin built into it": `apps/starter-app/src/app/admin/...` and local `apps/starter-app/src/app/api/admin/...` routes exist.
- "custom forms working - contact forms": public custom submit and contact form block paths exist.
- "with a form designer in the admin": form definition editor/list components exist inside the starter app.

## API Impact Summary

Upstream includes public form routes:

- `POST /api/forms/{tenantId}/entries`
- `GET /api/forms/{tenantId}/definitions/{type}`
- `POST /api/forms/{tenantId}/submit/{type}`

Upstream includes admin form routes:

- `GET /api/admin/forms/{tenantId}/definitions`
- `GET /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`
- `POST /api/admin/forms/{tenantId}/definitions`
- `PUT /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`
- `DELETE /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`
- `GET /api/admin/forms/{tenantId}/entries`
- `GET /api/admin/forms/{tenantId}/entries/{entryId}`
- `PUT /api/admin/forms/{tenantId}/entries/{entryId}/status`

Current active repo already has public form routes and both legacy/current admin read aliases, including `/api/admin/{tenantId}/form-entries` and `/api/admin/forms/{tenantId}/entries`. The upstream API must therefore be adapted into the active route contract; a blind merge can duplicate route names, change response shapes, or drop compatibility aliases.

## Forms, Contact, And Form Designer Summary

Upstream adds real FormDefinition and FormEntry model expansion plus form-block rendering in `pumpkin-block-views`. The custom submit route validates required fields against FormDefinition and creates FormEntry records. This overlaps with V2.8.48 and V2.8.49 FormDefinition/FormBuilder CRUD and the current Admin UI form builder.

The upstream form designer is valuable as reference UX and contract proof, but it should not replace the active Admin UI without a route/model compatibility pass.

## Starter And Sample App Summary

The partner starter app is `apps/starter-app`. It includes:

- embedded `/admin`;
- local Next API routes under `/api/admin/...`;
- form designer, page editor, theme editor, and page-map screens;
- contact form definition seed content;
- `ContactFormBlock` and FormBlock support.

Upstream also adds `apps/sample-app-2` and changes `apps/sample-app`. The starter app makes future tenant templates easier, but it creates a competing frontend/admin deployment pattern for the current production architecture.

## Admin UI Overlap Summary

Upstream standalone `apps/admin` gains users and theme controls. The active Admin UI already contains production SuperAdmin surfaces for onboarding, users, domains, backup/package intake, forms, pages, themes, publishing, import executions, operator handoffs, and outbound-link read-only work. Upstream Admin work should be cherry-adapted by feature area, not merged over the active Admin UI as a whole.

## DomainBinding, Backup, And Intake Summary

Upstream does not contain the active DomainBinding, Backup Manager, Package Intake, ImportExecution, OperatorHandoff, OutboundLinks, static-contact bridge, or Airstrip cutover state systems. A blind merge risks deleting or orphaning those systems from the active branch.

## Adopt, Adapt, Defer, Reject Summary

| Decision | Items |
| --- | --- |
| Adopt | Upstream endpoint inventory as comparison evidence; FormBlock renderer concepts; starter-app template ideas; API tests as contract references. |
| Adapt | Public form submit, FormDefinition/FormEntry model changes, starter form designer UX, admin users/theme controls. |
| Defer | Deploying `apps/starter-app`, deploying `apps/sample-app-2`, customer-facing form POST proof, embedded `/admin` use for production tenants. |
| Reject now | Blind merge, replacing standalone Admin UI, replacing active DomainBinding/backup/onboarding systems, running cutover and integration in one phase. |

## Recommended Integration Phase Map

1. Resume or re-approve Airstrip custom-domain cutover separately, using the currently proven production default host. No upstream integration is required before DNS/custom-domain work if the owner chooses speed and stability.
2. Run a V2.8.61I contract-only integration planning phase for upstream API/forms/model deltas.
3. Run an isolated source-adaptation phase for FormDefinition/FormEntry and public custom form submit, with no production writes until local and test contracts pass.
4. Run an Admin UI adaptation phase that selectively ports useful form designer, users, and theme controls into the standalone Admin UI.
5. Treat `apps/starter-app` as a future tenant starter/template lane after the current Airstrip cutover is closed.

## Runtime No-Regression Result

GET-only runtime checks passed:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Airstrip production default host `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

No POST, form submit, contact submit, deployment, appsetting change, DNS/custom-domain action, Azure mutation, indexing action, storage key/listKeys, SAS generation, Key Vault query, or protected-config read occurred.

## Files Created

- `deployment/architecture/tenant-website-publish-readiness/v2-8-61h-external-main-refresh-audit-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_MAIN_REFRESH_AUDIT_V2_8_61H.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_API_FORMS_STARTER_IMPACT_V2_8_61H.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_INTEGRATION_PLAN_V2_8_61H.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_CUTOVER_DEPENDENCY_UPDATE_V2_8_61H.md`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61H_EXTERNAL_MAIN_REFRESH_AUDIT_REPORT.md`

## Commit Instructions

Use exact paths only:

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61H_EXTERNAL_MAIN_REFRESH_AUDIT_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-61h-external-main-refresh-audit-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_MAIN_REFRESH_AUDIT_V2_8_61H.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_API_FORMS_STARTER_IMPACT_V2_8_61H.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_INTEGRATION_PLAN_V2_8_61H.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_CUTOVER_DEPENDENCY_UPDATE_V2_8_61H.md"

git commit -m "Add V2.8.61H external main refresh audit"
```
