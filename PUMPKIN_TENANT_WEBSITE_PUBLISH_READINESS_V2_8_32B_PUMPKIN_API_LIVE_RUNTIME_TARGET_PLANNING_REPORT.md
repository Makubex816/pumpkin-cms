# Pumpkin Tenant Website Publish Readiness V2.8.32B Pumpkin API Live Runtime Target Planning Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_live_runtime_target_planning_no_deploy_no_mutation`

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/`

## Phase status

V2.8.32B is complete as a planning/readiness phase. It did not deploy, create Azure resources, mutate Azure, list/show/set app settings, read protected config, query secrets, use deployment tokens, perform contact POSTs, write to production APIs, mutate DNS/custom domains, or run arbitrary outbound checks.

## Carryforward

V2.8.26 proved production `/api/static-contact` accepted one public contact POST and returned an accepted shape. V2.8.28 confirmed the operator could not find that trace/entry in Admin. V2.8.29 classified the issue as accepted contact response without Admin-visible `FormEntry` persistence. V2.8.30 selected `admin-persistence-required` and kept `/api/static-contact` as the public contract. V2.8.31 implemented local static contact forwarding to Pumpkin API mode with protected key-name selection. V2.8.32A proved the live runtime blocker: current Azure metadata has the Ice SWAs, static contact Function App, and production Cosmos resources, but no verified Pumpkin API Web App/App Service host.

## Target decision

Preferred live Pumpkin API hosting model: Azure App Service for Linux running the ASP.NET Core Pumpkin API.

Decision: create a new production App Service target rather than recover the stale candidate publish-profile host. The candidate `pumpkin-api-cdg2d3dwfpbbdygn.centralus-01.azurewebsites.net` remains unverified because current `az webapp list` returned no Web Apps. Container Apps is not the preferred first target because the subscription reports `Microsoft.App` as `NotRegistered` and the repo has no current container packaging surface. Function App is not preferred because Pumpkin API is an ASP.NET Core web application, while the existing Function App is the static contact endpoint.

Recommended target values:

| Value | Plan |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| App Service plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App name | `app-pumpkin-api-prod-eastus-001` |
| Region | `eastus` |
| SKU | `S1` minimum production baseline |
| Runtime | Linux App Service, .NET 10 / ASP.NET Core |
| Initial API base URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |
| Health endpoint target | Add `GET /api/health` before deployment; use `/` only as a temporary launch probe |
| Contact write endpoint | `POST /api/forms/ice-rink-rentals/entries` |
| Admin read endpoint | `GET /api/admin/ice-rink-rentals/form-entries` |

## Binding plan

Admin must bind `NEXT_PUBLIC_API_URL` to the same verified Pumpkin API base URL used by the static contact adapter.

Static contact must bind `FORM_DELIVERY_MODE=pumpkin-api`, `PUMPKIN_API_URL`, `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`, `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`, `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`, and allowed site/origin settings.

Pumpkin API must bind `Database__Provider=CosmosDb`, production Cosmos database metadata, JWT settings, and protected provider connection material through an approved secret-safe flow. The current source expects connection material in configuration; managed identity for Cosmos data-plane access would require separate source/runtime work unless a Key Vault reference is used for the existing setting name.

## Implementation sequence

1. Add source health endpoint and deployment artifact/runbook hardening.
2. Run local build/test checks.
3. Under a separate deployment approval, create the App Service resource group, plan, and Web App.
4. Bind protected settings without printing values.
5. Deploy the Pumpkin API artifact.
6. Run approved API health and authenticated read-only provider metadata checks.
7. Bind Admin to the API base URL and run Admin read-only form-entry checks.
8. Bind isolated SWA static contact to Pumpkin API mode.
9. Run isolated health/CORS checks and one approved no-PII write-read proof.
10. Update Resource Registry, Provider Profile, and Backup Center evidence.
11. Request separate production contact binding approval.

## Files created

- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/README.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/result-manifest.json`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/current-state-summary.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/v2-8-26-through-v2-8-32a-carryforward.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/pumpkin-api-source-inventory.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/pumpkin-api-live-target-decision.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/admin-runtime-api-wiring-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/public-contact-api-binding-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/form-entry-persistence-provider-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/protected-value-name-matrix.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/non-secret-resource-value-matrix.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/cors-origin-allowlist-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/deployment-artifact-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/rollback-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/runtime-qa-and-smoke-test-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/resource-registry-provider-profile-update-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/backup-center-requirements.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/implementation-sequence.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/contact-gate-status.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/deferred-gates-summary.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/security-boundary-result.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/no-deploy-no-post-confirmation.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/risk-and-open-decisions.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/next-phase-prompt.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/validation-summary.md`

## Exact-path commit instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32B_PUMPKIN_API_LIVE_RUNTIME_TARGET_PLANNING_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result"
git commit -m "Record V2.8.32B Pumpkin API live runtime target plan"
```
