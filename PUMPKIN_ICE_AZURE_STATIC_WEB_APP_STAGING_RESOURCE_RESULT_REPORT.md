# Pumpkin Ice Azure Static Web App Staging Resource Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice Azure Static Web Apps staging resource creation preflight/execution only.

This pass used Azure CLI discovery, created the minimal approved Ice staging resource group because it did not already exist, created the minimal approved Azure Static Web App staging resource because no suitable existing Static Web App was found, documented the default hostname, and stopped before static artifact deployment.

No static artifact deployment, production deployment, DNS change, Cloudflare change, CMS write, MediaAsset write, Function App setting change, endpoint redeployment, email sending, Microsoft 365 change, protected config read, production cutover, generated artifact staging, or Roller work occurred.

## Result

Azure staging resource readiness is yes.

| Item | Value |
| --- | --- |
| result | created |
| resource group | `rg-ice-static-staging` |
| resource group location | `eastus2` |
| Static Web App | `swa-ice-static-staging` |
| Static Web App location | `East US 2` |
| SKU | `Free` |
| provider | `None` |
| repository URL | none |
| branch | none |
| default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| custom hostnames | none |
| default environment status | `WaitingForDeployment` |

The execution approval named `rg-ice-static-staging` and `swa-ice-static-staging`, superseding the earlier preflight placeholder target of `rg-pumpkin-static-staging` and `swa-ice-rink-rentals-staging`.

## Azure Discovery

Before creation:

- Azure CLI available, version 2.87.0
- Azure account enabled and default subscription active
- existing resource groups found: `rg-ice-production-media`, `rg-ice-static-form-endpoint`, `DefaultResourceGroup-EUS`
- Static Web Apps found: none
- no suitable existing Ice staging Static Web App was found

No secrets, keys, tokens, connection strings, deployment tokens, credentials, protected config values, subscription IDs, or tenant IDs were printed.

## Post-Create Verification

Read-only verification after creation confirmed:

- resource group provisioning state: `Succeeded`
- Static Web App exists in `rg-ice-static-staging`
- Static Web App SKU: `Free`
- Azure default hostname assigned
- provider is `None`
- repository URL is null
- branch is null
- custom hostname list is empty
- default environment exists with status `WaitingForDeployment`

The `WaitingForDeployment` status is expected because static artifacts were not deployed in this run.

## Current Readiness Summary

| Gate | Status |
| --- | --- |
| official fresh CMS-backed export verified | yes |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| contact form production readiness | yes for approved endpoint/config |
| static output quality gates | yes |
| Azure staging resource readiness | yes |
| Azure staging deployment readiness | pending explicit deployment approval |
| Azure staging readiness | no, deployment and smoke tests still pending |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Remaining Blockers

Azure staging is not ready for use until a separate approval deploys the validated static artifact to the default hostname and smoke tests that hosted output.

Browser contact-form submission from the Azure default hostname may require a separate Function allowed-origin setting update after deployment/smoke planning. This run did not approve or perform any Function setting change.

DNS, Cloudflare, custom staging domain, production cutover, valid form submission, email sending, and Microsoft 365 work remain outside the current approval boundary.

## Next Approval Required

The next gate is Ice Azure Static Web Apps default-host static artifact deployment only, using:

```text
resource group: rg-ice-static-staging
Static Web App: swa-ice-static-staging
default hostname: happy-mud-0b375e20f.7.azurestaticapps.net
artifact root: apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

That future approval should still exclude production deployment, DNS changes, Cloudflare changes, CMS writes, MediaAsset writes, Function setting changes, endpoint redeploy, email/Microsoft 365 work, production cutover, and Roller work unless explicitly broadened.

## Evidence Package

```text
deployment/azure/ice-azure-static-web-app-staging-resource-result/
```
