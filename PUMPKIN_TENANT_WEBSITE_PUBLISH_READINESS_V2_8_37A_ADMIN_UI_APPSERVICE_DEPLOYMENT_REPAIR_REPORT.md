# Pumpkin Tenant Website Publish Readiness V2.8.37A Admin UI App Service Deployment Repair Report

Date: 2026-06-29

## Phase Status

V2.8.37A is complete.

Classification: `admin_ui_appservice_package_repair_succeeded_production_default_host_live_readonly_proven`

The V2.8.37 isolated OneDeploy/Kudu HTTP 400 was repaired by rebuilding the App Service ZIP with POSIX-style forward-slash entries. The corrected standalone Next.js package deployed successfully to the isolated Admin Web App, then the same artifact deployed successfully to the production Admin Web App default host.

## V2.8.37 Carryforward

- Admin source readiness passed in V2.8.37.
- Next standalone build/type-check passed after escaping text in Admin dashboard pages.
- The isolated Admin Web App `app-pumpkin-admin-isolated-centralus-001` existed from V2.8.37.
- The V2.8.37 isolated deployment attempt failed with OneDeploy/Kudu HTTP 400.
- The isolated Admin host returned 503 after the failed V2.8.37 deployment.
- Direct Admin API login/read-only proof had already shown the expected tenant was accessible, with zero pages seeded.

## OneDeploy 400 Diagnosis

Kudu detailed deployment logs showed `parallel_rsync.sh` failing on paths containing Windows backslashes, for example `.next\...`, with Linux rsync reporting `Invalid argument`.

Root cause: the V2.8.37 ZIP was structurally complete but contained Windows-style ZIP entry names. The repaired V2.8.37A package was created with forward-slash ZIP entries.

Classification: `zip_entry_backslash_paths_caused_linux_rsync_invalid_argument`

## Corrected Package Shape

- Package: standalone Next.js App Service ZIP.
- Entry style: POSIX forward slash only.
- Root `server.js`: present.
- Root `package.json`: present.
- `.next/server`: present.
- `.next/static`: present.
- `node_modules`: present.
- Protected env files: absent.
- ZIP size: 7,319,447 bytes.
- ZIP entries: 1,987.

Local standalone smoke proof passed before deployment:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- Login page contained expected auth text.
- Static references were present.

## Isolated Deployment And Runtime

Target: `app-pumpkin-admin-isolated-centralus-001`

Non-secret runtime settings were set for the Admin UI only:

- `NEXT_PUBLIC_API_URL`
- `NODE_ENV`
- `SCM_DO_BUILD_DURING_DEPLOYMENT`
- `HOSTNAME`
- `PORT`
- `WEBSITES_PORT`

Startup command: `node server.js`

Deployment ID:

`/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-pumpkin-api-prod-centralus/providers/Microsoft.Web/sites/app-pumpkin-admin-isolated-centralus-001/deploymentStatus/63da55be-c1c4-492e-b86a-6530ee3789a6`

Result: deployment completed successfully and the site started.

Runtime proof:

- `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net/`: HTTP 200.
- `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net/login`: HTTP 200.
- `_next/static` references: 24 occurrences across sampled HTML.
- Sampled static asset: HTTP 200.
- Returned HTML did not contain localhost API fallback references.

## Admin API Proof

The approved secure file was read only in process memory. No secret value, password, bearer token, or cookie was printed or written.

Live Admin login:

- Status: HTTP 200.
- Token received: true, not printed.
- Role: `TenantAdmin`.
- User tenant matched expected tenant: true.

Authenticated read-only Admin API checks:

- `GET /api/admin/tenants`: HTTP 200, tenant count 1, expected tenant visible.
- `GET /api/admin/pages?tenantId=...`: HTTP 200, page count 0.
- `GET /api/admin/tenants/{tenantId}/hubs`: HTTP 200, hub count 0.
- `GET /api/admin/tenants/{tenantId}/content-hierarchy`: HTTP 200, total pages 0.

Tenant/page/content classification: `container_ready_no_content_seeded`

## Production Deployment And Runtime

Target: `app-pumpkin-admin-prod-centralus-001`

The production Admin Web App did not exist at the start of V2.8.37A, so it was created on the approved existing App Service plan `asp-pumpkin-api-prod-centralus-001`.

Production deployment used the same isolated-proven ZIP artifact exactly once.

Deployment ID:

`/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-pumpkin-api-prod-centralus/providers/Microsoft.Web/sites/app-pumpkin-admin-prod-centralus-001/deploymentStatus/2a16f72a-a3a7-42d0-be53-aafafdb5daea`

Result: deployment completed successfully and the site started.

Runtime proof:

- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/`: HTTP 200.
- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login`: HTTP 200.
- `_next/static` references: 24 occurrences across sampled HTML.
- Sampled static asset: HTTP 200.
- Returned HTML did not contain localhost API fallback references.

## Guardrails

- No contact POST was sent.
- No page/content/media/import/publish document write was performed.
- No tenant create/update/delete was performed.
- No DNS or custom-domain mutation was performed.
- No indexing tooling was used.
- No Theme/Form work was performed.
- No protected config file was read except the approved secure file.
- No app settings list/show command was run.
- No broad staging command was used.

## Security And Cleanup

The approved secure directory `.tmp/v2-8-37/secure` was deleted after V2.8.37A success. Clipboard clear was attempted. Transient secret-bearing environment slots were cleared where present.

Validation also confirmed no staged files, no secret-shaped matches in the new reports, no disallowed command-shaped matches in the new reports, no trailing whitespace in the new reports, valid result manifest JSON, and a clean scoped `git diff --check`.

## Files

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-37a-admin-ui-appservice-deployment-repair-result/`

Key summary:

`deployment/architecture/tenant-website-publish-readiness/v2-8-37a-admin-ui-appservice-deployment-repair-result/validation-summary.md`

## Next Phase

The Admin UI default production host is live and read-only API proof passes. The next phase should seed or import tenant page/content data under a separate explicit write approval.
