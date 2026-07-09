# V2.8.61OH Starter Live Host Deployment Report

Phase status: passed with browser-tooling gap.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `starter_app_shared_live_onboarding_host_controlled_deployment_no_dns_no_post`.

V2.8.61OF carryforward was verified from commit `9bcfc8e8`: Party Pros backup export passed, 627 media blobs were backed up, runtime no-regression passed, Airstrip stayed untouched, and no deploy/DNS/contact/form/customer-facing POST/Ice mutation/keys/listKeys/SAS/appsetting mutation/Azure resource creation occurred in OF.

## Source Build

- Source: `apps/starter-app`
- Package lock: present
- Install: `npm ci` passed
- Type-check: `npm run type-check` passed after build regenerated `.next/types`
- Build: `npm run build` passed
- Build warning: `pumpkin-ts-models/dist/PageJsonConverter.js` references Node `fs` through package exports; build completed successfully
- Deploy fix: `apps/starter-app/next.config.js` now enables `output: 'standalone'`

## Target Resource

- App Service: `app-pumpkin-starter-preview-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Existing plan: `asp-pumpkin-api-prod-centralus-001`
- Plan kind/SKU: Linux B1
- Runtime: `NODE|22-lts`
- Startup command: `node server.js`
- Default host: `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`

Azure rejected the first create command because `NODE|20-lts` is no longer in the supported Linux runtime catalog. The target app still did not exist after that rejected call. The app was then created once with supported Node 22 LTS on the approved existing plan.

## Deployment

- Deployment package: standalone Next.js zip
- Package bytes: 6053498
- Package entries: 2201
- Package SHA-256: `511a46bdfce199bcbdc30032d825b1e861f3bd5701c03fef9ad506b62b2b1343`
- Successful zip deploy count: 1
- Failed zip deploy count: 0

Non-secret appsettings set:

- `NEXT_PUBLIC_PUMPKIN_API_URL`
- `PUMPKIN_API_URL`
- `PUMPKIN_SITE_NAME`
- `NEXT_TELEMETRY_DISABLED`
- `PORT`
- `WEBSITES_PORT`

No `PUMPKIN_API_KEY`, tenant secret, storage key, SAS, connection string, token, or cookie setting was added.

## Runtime Proof

Starter default host GET proof:

- `/`: HTTP 200
- `/admin/login`: HTTP 200
- `/admin`: HTTP 307 to `/admin/login`

GET-only no-regression passed 14/14:

- Ice apex/www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`
- Pumpkin API `/health`, `/api/health`
- Standalone Admin UI `/`, `/login`, `/dashboard`
- Starter default host `/`

Browser proof gap: local Chrome headless did not return usable DOM output, Edge headless hung, and a delayed temporary Chrome screenshot artifact appeared after the command reported no screenshot. The temporary profiles/artifacts were deleted and the screenshot was not counted as reliable browser proof. No visual artifacts were kept or staged.

## Boundary

Starter `/admin` remains tenant-local. Source route inventory is limited to dashboard, pages, page map, forms, themes, and auth. Standalone `apps/admin` remains the platform control plane. The starter app does not expose Backup Manager, Package Intake, Domain Manager, Users/Admins platform management, hardcopy/recovery/resource controls, or cross-tenant controls.

Party Pros preview is not yet enabled on the shared host because this phase did not approve tenant API key/tenant binding secrets or Party Pros page publishing. V2.8.61OI should approve a read-only preview integration path.

No Pumpkin API deploy, standalone Admin UI deploy, Airstrip deploy/action, Ice deploy/action, DNS/custom-domain action, contact POST, form submission, customer-facing POST, Party Pros content/media/user/form mutation, storage keys/listKeys/SAS, new App Service plan, new Cosmos/Storage/SWA/Key Vault/database, indexing, or Search Console action occurred.

## Result Docs

Repo-safe result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61oh-starter-live-host-deployment-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_SHARED_LIVE_HOST_V2_8_61OH.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_CONTROLLED_DEPLOYMENT_V2_8_61OH.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_ADMIN_BOUNDARY_PROOF_V2_8_61OH.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_PARTY_PROS_PREVIEW_READINESS_V2_8_61OH.md`

## Exact Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OH_STARTER_LIVE_HOST_DEPLOYMENT_REPORT.md deployment/architecture/tenant-website-publish-readiness/v2-8-61oh-starter-live-host-deployment-result deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_SHARED_LIVE_HOST_V2_8_61OH.md deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_CONTROLLED_DEPLOYMENT_V2_8_61OH.md deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_ADMIN_BOUNDARY_PROOF_V2_8_61OH.md deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_APP_PARTY_PROS_PREVIEW_READINESS_V2_8_61OH.md apps/starter-app/next.config.js
git commit -m "Add V2.8.61OH starter shared live host deployment"
```
