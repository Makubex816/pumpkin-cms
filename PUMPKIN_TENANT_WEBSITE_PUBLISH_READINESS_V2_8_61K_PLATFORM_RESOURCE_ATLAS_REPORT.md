# V2.8.61K Platform Resource Atlas Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `post_integration_platform_resource_atlas_plain_text_resource_map_no_mutation`.

## Carryforward

- V2.8.61I controlled upstream integration completed and kept Airstrip frozen.
- V2.8.61IA classified starter `/admin` as tenant-local only.
- V2.8.61J proved starter local runtime and chose local-only sandbox proof for that phase.
- V2.8.61G hardcopy remains outside the repo; this report is a repo-safe atlas and contains no raw secrets.

## Resource Counts

Read-only Azure inventory found:

- 1 accessible subscription: `Azure subscription 1` / `ff887def-fd83-4a19-9298-13d4b1687873`.
- 8 resource groups.
- 29 Azure resources.
- 6 App Services, 2 Static Web Apps, 2 App Service plans, 2 Cosmos accounts, 3 storage accounts, 3 Log Analytics workspaces, 2 action groups, 6 metric alerts, 1 Key Vault, 1 managed identity, and 1 Application Insights component.

## Production Core Summary

Core production resources are:

- Pumpkin API: `app-pumpkin-api-prod-centralus-001`.
- Standalone Admin UI: `app-pumpkin-admin-prod-centralus-001`.
- Shared App Service plan: `asp-pumpkin-api-prod-centralus-001`.
- Ice public Static Web App: `swa-ice-static-staging`, bound to `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`.
- Production Cosmos: `cosmos-pumpkin-prod-eastus`, database `pumpkin-prod-cms`, Continuous backup policy.
- Production media storage: `iceskatingmedia`, with `ice-rink-rentals-media` and `airstrip-club-las-vegas-media`.
- Observability: `law-pumpkin-prod-centralus-001`, `ag-pumpkin-prod-ops-email-001`, and six enabled metric alerts.

## Tenant Binding Summary

- Ice tenant `ice-rink-rentals` is live on apex and www custom domains through the production Ice Static Web App.
- Airstrip tenant `airstrip-club-las-vegas` remains frozen for this phase. It has production and isolated App Services in live Azure metadata and media in the shared production media storage account. Airstrip custom-domain DNS and Azure hostname binding remain incomplete per V2.8.61 docs.
- The current API inventory reported by V2.8.61G found 2 tenants, 3 admin users, and 1 DomainBinding.

## Starter App State

`apps/starter-app` is a committed local starter baseline. It is not deployed. Its `/admin` remains tenant-local only. Standalone `apps/admin` remains the platform/SuperAdmin control plane.

## Storage And Data Summary

- Cosmos production account: `cosmos-pumpkin-prod-eastus`; database `pumpkin-prod-cms`; 20 containers.
- Legacy/outbound-link staging Cosmos account: `cosmos-pumpkincms-stg-olm01`; database `pumpkincms-olm-staging`; 10 outbound-link containers.
- Production media storage: `iceskatingmedia`; blob soft delete, container soft delete, versioning, and change feed are enabled.
- Legacy static contact storage and outbound-link staging storage remain do-not-delete until dependency proof.

## Backup And Intake Artifact Summary

Repo-safe proof docs point to outside-repo artifacts:

- Airstrip full backup: `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61a-airstrip-full-backup-proof`.
- Airstrip restore dry-run: `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61b-airstrip-restore-dryrun-proof`.
- Package intake proof: `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61c-intake-analysis-proof`.
- Compiled package proof: `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61d-compiled-package-proof`.
- Operator E2E proof: `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\operator-workflow-proofs\v2-8-61f-airstrip-backup-intake-e2e`.
- Master operator hardcopy: `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-61g-pre-domain-cutover-master-operator-hardcopy`.

These paths may contain sensitive material or protected output and must not be staged.

## Runtime No-Regression

GET-only runtime proof passed 13/13:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.

No Airstrip route probe was run in V2.8.61K.

## Security Boundary

No live Azure mutation, deploy, appsetting read of values, appsetting mutation, DNS/custom-domain action, indexing, contact POST, form submission, customer-facing POST, media upload/delete, tenant/content/user/role/DomainBinding mutation, storage key/listKeys, SAS generation, Key Vault secret query, protected config read, or Airstrip disturbance occurred.

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61K_PLATFORM_RESOURCE_ATLAS_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-61k-platform-resource-atlas-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PLATFORM_RESOURCE_ATLAS_V2_8_61K.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TOP_DOWN_RESOURCE_MAP_V2_8_61K.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_RESOURCE_BINDING_LEDGER_V2_8_61K.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_DO_NOT_DELETE_RESOURCE_REGISTER_V2_8_61K.md`

## Commit Instructions

Use exact paths only:

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61K_PLATFORM_RESOURCE_ATLAS_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-61k-platform-resource-atlas-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_PLATFORM_RESOURCE_ATLAS_V2_8_61K.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_TOP_DOWN_RESOURCE_MAP_V2_8_61K.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_RESOURCE_BINDING_LEDGER_V2_8_61K.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_DO_NOT_DELETE_RESOURCE_REGISTER_V2_8_61K.md"

git commit -m "Add V2.8.61K platform resource atlas"
```
