# Pumpkin Tenant Website Publish Readiness V2.8.32D Pumpkin API App Service Health Deployment Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_app_service_provision_health_deploy`

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-32d-pumpkin-api-app-service-health-deployment-result/`

## Phase Status

V2.8.32D is blocked after partial Azure provisioning.

The planned resource group `rg-pumpkin-api-prod-eastus` was created successfully in `eastus`. The planned Linux App Service plan `asp-pumpkin-api-prod-eastus-001` was not created because Azure returned an East US Total VMs quota blocker. Web App creation, ZIP deployment, and live health checks were not attempted after that blocker.

## V2.8.32C Carryforward

V2.8.32C provided:

- dependency-light `GET /api/health` and `GET /health`;
- FormEntry write route shape `POST /api/forms/{tenantId}/entries`;
- Admin read route shape `GET /api/admin/{tenantId}/form-entries`;
- Release build and scoped test pass;
- local publish with `ExcludeAppSettingsFromPublish=true`;
- artifact `.tmp/v2-8-32c/pumpkin-api.zip`;
- artifact SHA-256 `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854`.

## Azure Account Context

Azure context was verified with `az account show`:

- environment: `AzureCloud`
- subscription: `Azure subscription 1`
- subscription id: `ff887def-fd83-4a19-9298-13d4b1687873`
- state: `Enabled`
- tenant default domain: `iceskatingrinkrentals.com`
- user: `Contact@iceskatingrinkrentals.com`

## Linux Runtime Availability Result

`az webapp list-runtimes --os linux` showed the planned runtime is available:

- config: `DOTNETCORE|10.0`
- version: `.NET 10.0 (LTS)`
- support: `Active`
- end of life: `2028-12-01`

## Resource Group Provision Result

`rg-pumpkin-api-prod-eastus` was missing and was created successfully in `eastus`.

Provisioning state: `Succeeded`.

## App Service Plan Provision Result

`asp-pumpkin-api-prod-eastus-001` was missing. Creation was attempted with the planned Linux App Service plan target and failed because Azure reported:

```text
Current Limit (Total VMs): 0
Current Usage: 0
Amount required for this deployment (Total VMs): 1
Minimum new limit: 1
```

Follow-up `az appservice plan show` returned `ResourceNotFound`.

## Web App Provision Result

`app-pumpkin-api-prod-eastus-001` was not created because the App Service plan does not exist.

Follow-up `az webapp show` returned `ResourceNotFound`.

## Artifact Reverification

Artifact source: `.tmp/v2-8-32c/pumpkin-api.zip`

Reverified:

- exists: `true`
- manifest file count: `56`
- ZIP entry count including directory entries: `61`
- SHA-256: `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854`
- blocked config entry count: `0`

## ZIP Deployment Result

ZIP deployment was not attempted.

Deployment attempt count: `0`.

Reason: the App Service plan and Web App were not available after the Azure quota blocker.

## Live Health Check Result

The approved health URLs were not requested:

- `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/health`
- `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/health`

Reason: the Web App was not created and the ZIP was not deployed.

## Live API Readiness Summary

The live Pumpkin API is not ready for protected provider binding.

Required next:

1. Resolve East US Total VMs quota for the planned Linux App Service plan.
2. Create or confirm `asp-pumpkin-api-prod-eastus-001`.
3. Create or confirm `app-pumpkin-api-prod-eastus-001`.
4. Deploy the Pumpkin API ZIP exactly once under renewed approval.
5. Run only `/health` and `/api/health`.

## Future Provider Binding Plan

Provider binding remains future-only and must wait for successful health-only deployment. A later approval must explicitly authorize protected provider settings, static contact binding, bounded FormEntry write validation, and bounded Admin readback validation.

## Rollback Plan

Only the resource group was created. If the operator chooses to remove the partial Azure resource state, use a separately approved rollback:

```powershell
az group delete --name rg-pumpkin-api-prod-eastus
```

Do not run rollback automatically.

## Boundary Confirmation

Confirmed:

- No contact POST.
- No production contact POST.
- No isolated contact POST.
- No FormEntry write test.
- No Admin readback test.
- No provider protected binding.
- No protected config read.
- No `.env.local` read or mutation.
- No appsettings or local.settings content read.
- No Key Vault secret query.
- No keys/listKeys.
- No connection string or SAS generation.
- No app-setting secret binding.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No deployment token action.
- No arbitrary outbound URL checks.
- No ZIP deployment attempt.

## Files Created Or Modified

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32D_PUMPKIN_API_APP_SERVICE_HEALTH_DEPLOYMENT_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32d-pumpkin-api-app-service-health-deployment-result/`

## Validation

See `deployment/architecture/tenant-website-publish-readiness/v2-8-32d-pumpkin-api-app-service-health-deployment-result/validation-summary.md`.

## Next Approval

The exact next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32d-pumpkin-api-app-service-health-deployment-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32D_PUMPKIN_API_APP_SERVICE_HEALTH_DEPLOYMENT_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32d-pumpkin-api-app-service-health-deployment-result"
git commit -m "Record V2.8.32D Pumpkin API health deployment blocker"
```

