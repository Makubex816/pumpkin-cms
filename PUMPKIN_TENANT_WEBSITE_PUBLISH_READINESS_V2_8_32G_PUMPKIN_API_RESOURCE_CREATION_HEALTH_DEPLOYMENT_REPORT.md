# Pumpkin Tenant Website Publish Readiness V2.8.32G Pumpkin API Resource Creation Health Deployment Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_resource_creation_retry_health_deployment`

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-resource-creation-health-deployment-result/`

## Phase Status

V2.8.32G is blocked at the approved App Service plan creation retry.

The resource group was confirmed, the artifact was verified, and the required Linux `.NET 10` runtime was available. The approved Linux B1 App Service plan creation attempt failed because East US Total VMs quota is still `0` and the deployment requires `1`.

Unresolvable classification: `unresolvable_via_path_a_until_quota_approved`.

No Web App was created, no ZIP deployment was attempted, and no live health GET was sent.

## V2.8.32F Carryforward

V2.8.32F recorded:

- Path A preserved.
- Subscription locked to `ff887def-fd83-4a19-9298-13d4b1687873`.
- Support ticket not visible through CLI.
- Resource group `rg-pumpkin-api-prod-eastus` existed.
- App Service plan `asp-pumpkin-api-prod-eastus-001` was absent.
- Web App `app-pumpkin-api-prod-eastus-001` was absent.
- Deployment retry readiness was not ready by polling evidence.

The V2.8.32G approval explicitly allowed one bounded resource creation retry with blocker diagnosis.

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

Every created or confirmed resource remained under `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/`.

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

`az webapp list-runtimes --os linux` showed the required runtime is available:

| Field | Value |
| --- | --- |
| Config | `DOTNETCORE|10.0` |
| Runtime | `.NET` |
| Version | `10.0 (LTS)` |
| Support | `Active` |
| End of life | `2028-12-01` |

Runtime gate passed.

## Resource Group Create/Confirm Result

Resource group `rg-pumpkin-api-prod-eastus` was confirmed.

| Field | Value |
| --- | --- |
| ID | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-pumpkin-api-prod-eastus` |
| Location | `eastus` |
| Type | `Microsoft.Resources/resourceGroups` |
| Provisioning state | `Succeeded` |
| Created in V2.8.32G | `false` |

## App Service Plan Create/Confirm Result

Plan target:

| Field | Value |
| --- | --- |
| Name | `asp-pumpkin-api-prod-eastus-001` |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| Region | `eastus` |
| SKU | `B1` |
| Linux | `true` |

Initial read-only show result: `ResourceNotFound`.

One approved creation attempt was sent. Azure returned:

```text
Operation cannot be completed without additional quota.
Location: East US
Current Limit (Total VMs): 0
Current Usage: 0
Amount required for this deployment (Total VMs): 1
Minimum new limit: 1
```

Follow-up read-only show result: `ResourceNotFound`.

Plan state: not created.

## Web App Create/Confirm Result

Web App target:

`app-pumpkin-api-prod-eastus-001`

Initial read-only show result: `ResourceNotFound`.

Web App creation was not attempted because the App Service plan was not created.

## ZIP Deployment Result

ZIP deployment was not attempted.

Deployment attempt count: `0`.

Reason: the App Service plan was not created, and the Web App does not exist.

## Live Health Check Result

No health GET requests were sent.

Skipped approved URLs:

- `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/health`
- `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/health`

Reason: deployment did not occur.

## Fallback Diagnosis Result

The blocker is not a local artifact issue, not a runtime issue, and not a target-name issue at the Web App layer.

Diagnosis:

| Area | Result |
| --- | --- |
| Artifact | Ready |
| Runtime | Ready |
| Resource group | Ready |
| App Service plan | Blocked by East US Total VMs quota |
| Web App | Not attempted after plan blocker |
| ZIP deployment | Not attempted |
| Health checks | Not attempted |

The allowed correction scope did not include quota approval, provider registration, RBAC role changes, alternate region, alternate SKU, or alternate target name selection. No correction was applied.

## Unresolvable Classification

Classification: `unresolvable_via_path_a_until_quota_approved`

Exact next unblock action:

Confirm East US Total VMs quota has been raised from `0` to at least `1` for subscription `ff887def-fd83-4a19-9298-13d4b1687873`, then request a new bounded V2.8.32G-R retry approval before rerunning plan creation.

## Live API Readiness Summary

The live Pumpkin API is not ready.

| Gate | Status |
| --- | --- |
| Artifact ready | Passed |
| Runtime ready | Passed |
| Resource group ready | Passed |
| App Service plan ready | Failed |
| Web App ready | Not attempted |
| ZIP deployed | Not attempted |
| `/health` passed | Not attempted |
| `/api/health` passed | Not attempted |

The API is not ready for provider binding, app-setting secret binding, contact validation, or Admin/FormEntry validation.

## Future Provider-Binding Plan

Provider binding remains future-only and must wait for successful health-only deployment.

Future approval must explicitly cover:

- protected provider settings;
- static contact binding;
- bounded FormEntry write validation;
- bounded Admin readback validation.

None of those actions occurred in V2.8.32G.

## Rollback Plan

No new Azure resource was successfully created in V2.8.32G.

The existing resource group was created in V2.8.32D. If the operator later abandons Path A, resource group cleanup requires a separate rollback approval. Do not delete it automatically.

## Contact Gate Status

The contact gate remains closed.

No contact form POST, production API write, FormEntry write/read validation, Admin live API read validation, provider binding, static contact binding, or app-setting secret binding occurred.

## Boundary Confirmation

Confirmed for V2.8.32G:

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

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32G_PUMPKIN_API_RESOURCE_CREATION_HEALTH_DEPLOYMENT_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-resource-creation-health-deployment-result/`

## Validation

See `deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-resource-creation-health-deployment-result/validation-summary.md`.

## Next Approval

The exact next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-resource-creation-health-deployment-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32G_PUMPKIN_API_RESOURCE_CREATION_HEALTH_DEPLOYMENT_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32g-pumpkin-api-resource-creation-health-deployment-result"
git commit -m "Record V2.8.32G Pumpkin API quota-blocked health deployment retry"
```
