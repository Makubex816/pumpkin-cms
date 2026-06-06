# Pumpkin Ice Static Form Graph Code Redeploy Result Report

Generated: 2026-06-05

## Scope

Approved action: redeploy the existing Ice static form Azure Function with the new Graph-capable code in dry-run/no-email mode only.

No real email was sent. No Microsoft 365 changes were made. No Graph app registration was created. No Graph permission grant occurred. No Exchange Online RBAC change occurred. No Azure app setting was changed to Graph mode. No Graph credentials were configured. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No protected config was read. Roller remains paused.

## Existing Function App Redeployed

| Item | Value |
| --- | --- |
| Resource group | `rg-ice-static-form-endpoint` |
| Function App | `func-ice-static-contact-20260605` |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Route | `/api/static-contact` |
| Redeploy result | yes |
| Deployment method | Azure CLI zip deployment |
| Deployment id | `5989b4ef54af46c2b3d0a2e3de49c9b7` |
| Deployment status | `4` |
| Deployment complete | `true` |

Temporary deployment package and staging folder were created outside the repo under `%TEMP%` and removed after deployment.

## Local Package Verification

Run from `deployment/static-azure/forms/static-form-endpoint`:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

## Pre-Redeploy Endpoint Health

| Check | Status | Result |
| --- | --- | --- |
| `OPTIONS` approved origin | 204 | pass |
| valid frontend dry-run payload | 200 | pass |
| valid legacy dry-run payload | 200 | pass |
| invalid email | 400 | pass |
| unknown routing | 400 | pass |
| unknown recipient | 400 | pass |
| oversized message | 400 | pass |
| honeypot | 400 | pass |
| unapproved origin | 400 | pass |
| secret-pattern response scan | none | pass |

## Post-Redeploy Endpoint Health

| Check | Status | Result |
| --- | --- | --- |
| `OPTIONS` approved origin | 204 | pass |
| valid frontend dry-run payload | 200 | pass |
| valid legacy dry-run payload | 200 | pass |
| invalid email | 400 | pass |
| unknown routing | 400 | pass |
| unknown recipient | 400 | pass |
| oversized message | 400 | pass |
| honeypot | 400 | pass |
| unapproved origin | 400 | pass |
| secret-pattern response scan | none | pass |

## Dry-Run Mode Confirmation

Safe app setting status check by name/status only:

| Check | Result |
| --- | --- |
| `STATIC_FORM_FORWARD_MODE` is dry-run | true |
| `FORM_DELIVERY_MODE` active Graph/m365-Graph | false |
| Microsoft Graph app setting name count | 0 |

No app-setting update command was run. The endpoint remains dry-run/no-email. The new Graph code is present in the redeployed package but inactive.

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form no-email endpoint deployed | yes |
| static form no-email validator wiring | yes |
| Graph delivery local implementation | yes |
| Graph-capable code deployed to Function | yes |
| contact form production readiness | no |
| real email delivery readiness | pending Microsoft 365/RBAC/app settings/live-test approval |
| Microsoft 365/email setup readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Remaining Blocker

Real email delivery still requires separate approval for Microsoft 365 app/managed identity setup, Graph permissions, Exchange Online RBAC for Applications, server-side Azure app settings or Key Vault references, endpoint Graph-mode activation, endpoint redeploy/config verification, and one approved live email test.

