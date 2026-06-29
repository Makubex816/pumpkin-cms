# V2.8.37 Admin UI Live Deployment + Read-Only Proof Report

Date: 2026-06-29

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `admin_ui_live_deployment_tenant_page_content_readonly_proof`.

Status: `blocked_after_isolated_onedeploy_failure`.

## Executive Result

V2.8.37 moved the Admin UI source from local-only unknown state to a deployable standalone Next.js artifact and created the isolated Admin App Service target, but the isolated Azure OneDeploy attempt failed with HTTP 400. The isolated default host returned 503 after the failed deployment. Per hard stop, production Admin UI deployment was not attempted.

The live Pumpkin Admin API read-only proof passed independently using the approved secure file in memory only. Login returned 200, the authenticated user tenant matched `ice-rink-rentals`, role was `TenantAdmin`, and read-only tenant/page/content endpoints returned 200.

## V2.8.36 Carryforward

- Multi-tenancy remains a hard platform contract.
- Active endpoint contract remains the V2.8.36 contract.
- Active Cosmos containers remain aligned: `Page`, `MediaAsset`, `PublishRun`, and `ImportRun` exist with `/tenantId`.
- `Tenant`, `User`, and `FormEntry` remain in place.
- Themes, Form Definitions, and forms remain excluded.
- FormEntry/contact remains no-regression only.

## Source Readiness

Admin source path: `apps/admin`.

Build findings:

- Admin app is a Next.js app.
- API binding uses `NEXT_PUBLIC_API_URL`.
- Source does not use server-only Next APIs such as `headers()` or `cookies()`.
- Build output includes dynamic routes, so App Service fallback was selected over Static Web Apps.
- `next.config.js` was updated to produce standalone output.
- Small JSX lint text fixes were applied.

Validation:

- `npm --prefix apps/admin run type-check`: passed.
- `NEXT_PUBLIC_API_URL` set to live Pumpkin API during build.
- `npm --prefix apps/admin run build`: passed with warnings.
- Local standalone artifact smoke test served `/` and `/login` with HTTP 200.
- Built client bundle contains the live Pumpkin API URL and not the localhost API fallback.

## Deployment Shape Decision

Preferred Static Web Apps path was not used because direct SWA deployment tooling was not available in this environment, and the Admin app emits dynamic Next routes. The approved App Service fallback was used on existing plan:

- Resource group: `rg-pumpkin-api-prod-centralus`
- Plan: `asp-pumpkin-api-prod-centralus-001`
- Isolated app: `app-pumpkin-admin-isolated-centralus-001`

## Isolated Target And Deployment

Isolated target was created:

- Default host: `app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`
- Runtime: `NODE|22-lts`
- Startup command: `node server.js`
- Non-secret settings applied: live `NEXT_PUBLIC_API_URL`, production Node mode, host/port settings, deployment build disabled.

Isolated deployment:

- One deploy attempt was made.
- Deployment ID: `45998942-bc56-47ff-a3a0-976e76c1a3ed`
- Deployment status: failed (`status: 3`)
- CLI error: HTTP 400 from OneDeploy/Kudu.
- Top-level log ended with `Deployment Failed. deployer = OneDeploy deploymentPath = OneDeploy`.

Isolated runtime proof:

- `/`: HTTP 503.
- `/login`: HTTP 503.

Classification: `isolated_onedeploy_failed_before_runtime_proof`.

## Admin API Read-Only Proof

Using the approved secure file in memory only:

- `POST /api/auth/login`: 200.
- Token returned: yes, not printed or written.
- Authenticated tenant matched `ice-rink-rentals`: true.
- Role: `TenantAdmin`.
- `GET /api/admin/tenants`: 200, count 1, contains active tenant.
- `GET /api/admin/pages?tenantId=ice-rink-rentals`: 200, count 0.
- `GET /api/admin/tenants/ice-rink-rentals/hubs`: 200, count 0.
- `GET /api/admin/tenants/ice-rink-rentals/content-hierarchy`: 200, total pages 0.
- Sitemap proof was not attempted because no tenant API key field was approved for this secure file.

Classification: `admin_api_readonly_proof_passed`.

Empty page/content results are classified as `container_ready_no_content_seeded`, not a failure.

## Production Result

Production Admin UI target/deployment/runtime proof was not attempted. Hard stop applied after isolated deployment failed.

## Multi-Tenancy Guard

Pass:

- Admin API proof verified tenant and role context.
- Tenant list contained only the authenticated tenant for `TenantAdmin`.
- Page/content proof remained tenant-scoped to `ice-rink-rentals`.
- Admin UI source uses selected/current tenant context for pages and tenant-aware API calls.
- API base was built against live Pumpkin API, not localhost.

Care point:

- The full Admin UI contains write-capable controls in source. V2.8.37 did not exercise writes. Future live Admin UI exposure should include explicit operator controls or role/feature gates before broader use.

## Security Boundary

- Approved secure file was read.
- No password, bearer token, cookie, deployment credential, or secret value was printed or written.
- Secure file was not copied into the repo.
- Secure file was not staged.
- Secure file was not deleted because the phase is blocked, not successful.
- No contact POST occurred.
- No tenant/page/content/media/import/publish document write occurred.
- No DNS/custom-domain mutation occurred.
- No Search Console/indexing occurred.
- No Theme/Form/FormDefinition work occurred.

## Files

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_37_ADMIN_UI_LIVE_READONLY_PROOF_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-37-admin-ui-live-readonly-proof-result/`

Modified for deployable Admin build:

- `apps/admin/next.config.js`
- `apps/admin/src/app/dashboard/icons/page.tsx`
- `apps/admin/src/app/dashboard/page.tsx`
- `apps/admin/src/app/dashboard/tenants/page.tsx`

## Next Approval

The exact next approval prompt is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-37-admin-ui-live-readonly-proof-result/next-phase-prompt.md`
