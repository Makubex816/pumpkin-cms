# Pumpkin Tenant Website Publish Readiness V2.8.32G Pumpkin API Live Resource Creation Superpass Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_live_resource_creation_superpass_health_deployment`

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-live-resource-creation-superpass-result/`

## Phase Status

V2.8.32G Superpass is complete with a deployment blocker.

The primary East US target was attempted first and remained blocked by Total VMs quota `0`. Same-subscription fallback was then used. East US 2 was also quota-blocked for `B1`, `S1`, and `P0V3`. Central US with Linux `B1` succeeded, and the selected Web App was created.

ZIP deployment was sent exactly once to the selected Web App and failed server-side with HTTP `400`. No blind retry was performed. Health checks were not run because deployment did not succeed.

Active blocker: `deployment_server_side_400_diagnostics_required`.

## V2.8.32F Carryforward

V2.8.32F recorded:

- Path A preserved.
- Subscription locked to `ff887def-fd83-4a19-9298-13d4b1687873`.
- Support ticket not visible through CLI.
- Resource group `rg-pumpkin-api-prod-eastus` existed.
- App Service plan `asp-pumpkin-api-prod-eastus-001` was absent.
- Web App `app-pumpkin-api-prod-eastus-001` was absent.
- Deployment retry was not ready by polling evidence.

This superpass approval allowed primary retry and same-subscription fallback.

## Subscription Lock Proof

The active Azure subscription was set and verified before Azure resource commands:

- `az account set --subscription ff887def-fd83-4a19-9298-13d4b1687873`
- `az account show`

Verified account context:

| Field | Value |
| --- | --- |
| Environment | `AzureCloud` |
| Subscription | `Azure subscription 1` |
| Subscription id | `ff887def-fd83-4a19-9298-13d4b1687873` |
| State | `Enabled` |
| Tenant default domain | `iceskatingrinkrentals.com` |
| User | `Contact@iceskatingrinkrentals.com` |

Every created resource ID began with `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/`.

## Artifact Reverification Result

Artifact source:

`.tmp/v2-8-32c/pumpkin-api.zip`

| Field | Value |
| --- | --- |
| Exists | `true` |
| SHA-256 | `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854` |
| Matches expected | `true` |
| ZIP entry count including directory entries | `61` |
| Blocked config entry count | `0` |
| Rebuild needed | `false` |

No protected config was read.

## Linux Runtime Availability Result

`az webapp list-runtimes --os linux` confirmed:

| Field | Value |
| --- | --- |
| Config | `DOTNETCORE|10.0` |
| Runtime | `.NET` |
| Version | `10.0 (LTS)` |
| Support | `Active` |
| End of life | `2028-12-01` |

Runtime gate passed.

## Primary Target Attempt Result

Primary target:

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| Plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App | `app-pumpkin-api-prod-eastus-001` |
| Region | `eastus` |
| SKU | `B1` |

Result:

- Resource group existed and was `Succeeded`.
- App Service plan was absent.
- Web App was absent.
- One Linux `B1` App Service plan creation attempt was sent.
- Azure returned Total VMs quota blocker: current limit `0`, required `1`, minimum new limit `1`.

Primary target did not work.

## Fallback Target Decision

Existing-plan fallback was evaluated first. The only existing App Service plan found was:

| Field | Value |
| --- | --- |
| Name | `EastUSPlan` |
| Resource group | `rg-ice-static-form-endpoint` |
| Location | `East US` |
| SKU | `Y1` |
| Reserved/Linux | `false` |
| Kind | `functionapp` |

It was not suitable for the Pumpkin API because it is a Windows Consumption Function plan in an unrelated resource group.

Fallback region/SKU attempts:

| Region | SKU | Result |
| --- | --- | --- |
| `eastus2` | `B1` | Quota blocked, Total VMs `0` |
| `eastus2` | `S1` | Quota blocked, Total VMs `0` |
| `eastus2` | `P0V3` | Quota blocked, Total VMs `0` |
| `centralus` | `B1` | Plan created successfully |

Selected fallback target: Central US, Linux `B1`.

## Selected Target Record

| Field | Value |
| --- | --- |
| Selection reason | First viable approved fallback region/SKU |
| Region | `centralus` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| App Service plan | `asp-pumpkin-api-prod-centralus-001` |
| Web App | `app-pumpkin-api-prod-centralus-001` |
| Runtime | `DOTNETCORE|10.0` |
| SKU | `B1` |
| API base URL | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net` |

The selected API base URL is not canonical for future binding yet because health checks did not pass.

## Resource Group Create/Confirm Result

Resource groups touched in this phase:

| Resource group | Region | Result |
| --- | --- | --- |
| `rg-pumpkin-api-prod-eastus` | `eastus` | Confirmed existing |
| `rg-pumpkin-api-prod-eastus2` | `eastus2` | Created for fallback attempts |
| `rg-pumpkin-api-prod-centralus` | `centralus` | Created for selected fallback |

All created/confirmed resource IDs were in subscription `ff887def-fd83-4a19-9298-13d4b1687873`.

## App Service Plan Create/Confirm Result

Selected plan:

| Field | Value |
| --- | --- |
| Name | `asp-pumpkin-api-prod-centralus-001` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Location | `centralus` |
| SKU | `B1` |
| Kind | `linux` |
| Reserved/Linux | `true` |
| Provisioning state | `Succeeded` |
| Status | `Ready` |

Primary East US plan was not created. East US 2 fallback plan was not created. Central US fallback plan was created.

## Web App Create/Confirm Result

Selected Web App:

| Field | Value |
| --- | --- |
| Name | `app-pumpkin-api-prod-centralus-001` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Location | `Central US` |
| Kind | `app,linux` |
| State | `Running` |
| Default host name | `app-pumpkin-api-prod-centralus-001.azurewebsites.net` |
| App Service plan | `asp-pumpkin-api-prod-centralus-001` |

Web App creation succeeded.

## ZIP Deployment Result

Deployment target:

`app-pumpkin-api-prod-centralus-001`

Deployment attempt count: `1`.

Result: failed server-side after Azure received the deployment.

Public-safe deployment summary:

- ZIP artifact was verified before deployment.
- Azure deployment command started.
- Kudu warm-up started.
- Azure returned HTTP `400`.
- Azure suggested checking latest deployment diagnostics.
- No diagnostic URL was requested in this phase.
- No retry was performed.

## Live Health Check Result

Live health checks were not run.

Skipped URLs:

- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`
- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`

Reason: ZIP deployment did not succeed.

## Fallback Diagnosis Result

The superpass successfully moved past the East US quota blocker by selecting Central US. The active blocker moved to deployment.

| Area | Result |
| --- | --- |
| Artifact | Verified locally |
| Runtime | Available |
| Existing plan fallback | No suitable existing plan |
| Primary East US plan | Quota blocked |
| East US 2 fallback plan | Quota blocked |
| Central US fallback plan | Created |
| Central US Web App | Created |
| ZIP deployment | Failed server-side with HTTP `400` |
| Health checks | Not run |

## Unresolvable Classification

Classification: `deployment_server_side_400_diagnostics_required`

Exact next unblock action:

Approve a bounded deployment diagnostics phase for the selected Web App `app-pumpkin-api-prod-centralus-001` that may read public-safe deployment status for the failed ZIP deploy and inspect/rebuild the local ZIP artifact if needed, without app settings, protected config, secrets, keys, connection strings, SAS, DNS, indexing, contact POST, or arbitrary outbound checks.

## Live API Readiness Summary

The live Pumpkin API is not ready.

| Gate | Status |
| --- | --- |
| Artifact ready | Passed |
| Runtime ready | Passed |
| Same-subscription target selected | Passed |
| App Service plan ready | Passed |
| Web App ready | Passed |
| ZIP deployed | Failed |
| `/health` passed | Not run |
| `/api/health` passed | Not run |

The API is not ready for provider binding, app-setting secret binding, contact validation, or FormEntry/Admin validation.

## Future Provider-Binding Plan

Provider binding remains future-only and must wait for successful health-only deployment.

Future approval must explicitly cover:

- protected provider settings;
- static contact binding;
- bounded FormEntry write validation;
- bounded Admin readback validation.

None of those actions occurred in V2.8.32G Superpass.

## Rollback Plan

Resources created in V2.8.32G Superpass:

- `rg-pumpkin-api-prod-eastus2`
- `rg-pumpkin-api-prod-centralus`
- `asp-pumpkin-api-prod-centralus-001`
- `app-pumpkin-api-prod-centralus-001`

No rollback was performed. Any cleanup requires separate explicit rollback approval.

If Central US remains the selected target, keep `rg-pumpkin-api-prod-centralus`, the plan, and the Web App for the next diagnostics/retry phase.

If East US 2 fallback is abandoned, cleanup of `rg-pumpkin-api-prod-eastus2` also requires separate approval.

## Contact Gate Status

The contact gate remains closed.

No contact form POST, production API write, FormEntry write/read validation, Admin live API read validation, provider binding, static contact binding, or app-setting secret binding occurred.

## Boundary Confirmation

Confirmed for V2.8.32G Superpass:

- No contact POST occurred.
- No production API write occurred.
- No FormEntry write/read validation occurred.
- No Admin live API read validation occurred.
- No provider protected binding occurred.
- No app settings were listed, shown, or set.
- No protected config was read.
- No `.env.local` action occurred.
- No appsettings/local.settings file was read.
- No Key Vault secret query occurred.
- No keys/listKeys occurred.
- No connection string or SAS generation occurred.
- No DNS/custom-domain mutation occurred.
- No Search Console/indexing occurred.
- No deployment token action occurred.
- No arbitrary outbound URL checks occurred.
- No files were staged.

## Files Created Or Modified

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32G_PUMPKIN_API_LIVE_RESOURCE_CREATION_SUPERPASS_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-live-resource-creation-superpass-result/`

## Validation

See `deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-live-resource-creation-superpass-result/validation-summary.md`.

## Next Approval

The exact next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-live-resource-creation-superpass-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32G_PUMPKIN_API_LIVE_RESOURCE_CREATION_SUPERPASS_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-live-resource-creation-superpass-result"
git commit -m "Record V2.8.32G Pumpkin API live resource superpass"
```
