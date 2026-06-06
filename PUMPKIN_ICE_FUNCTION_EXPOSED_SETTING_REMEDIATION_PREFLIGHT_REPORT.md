# Pumpkin Ice Function Exposed Setting Remediation Preflight Report

Generated: 2026-06-06

## Scope

Approved action: Ice Azure Function exposed setting remediation preflight only.

No setting values were printed. No storage keys were listed. No connection strings were printed. No key rotation occurred. No Azure Function app settings were changed. No endpoint redeploy occurred. No email was sent. No Microsoft 365 changes were made. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No protected local config was read. Roller remains paused.

## Result

Preflight complete.

The previous command transcript accidentally emitted Function app setting values. By name only, the storage connection setting values that require remediation are:

| Setting name | Classification | Runtime storage connection? |
| --- | --- | --- |
| `AzureWebJobsStorage` | Azure Functions runtime storage connection setting | yes |
| `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` | Function content share storage connection setting | no, content storage connection |
| `AzureWebJobsDashboard` | legacy dashboard storage setting | no, legacy dashboard storage connection |

Because `AzureWebJobsStorage` was among the exposed storage connection settings, the exposure includes the Function runtime storage connection setting.

## Function App

| Field | Value |
| --- | --- |
| Resource group | `rg-ice-static-form-endpoint` |
| Function App | `func-ice-static-contact-20260605` |
| Default host | `func-ice-static-contact-20260605.azurewebsites.net` |
| State | `Running` |
| Enabled | true |
| Location | `East US` |
| Plan | `EastUSPlan` |
| Function route observed | `static-contact` |

## Storage Account

Safe metadata only:

| Field | Value |
| --- | --- |
| Storage account | `iceforms20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| Location | `eastus` |
| Kind | `StorageV2` |
| SKU | `Standard_LRS` |
| Provisioning state | `Succeeded` |
| Primary status | `available` |
| Blob public access | false |
| Minimum TLS | `TLS1_2` |

No storage keys were listed.

## Recommended Remediation

Recommended future path: rotate the exposed storage account key in a controlled execution and update the existing Function app storage connection settings in one guarded operation:

- `AzureWebJobsStorage`
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
- `AzureWebJobsDashboard`

The execution must avoid printing keys or connection strings. It should update all affected storage connection settings together, restart the Function App only if required, and validate `/api/static-contact` in dry-run/no-email mode.

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| Graph-capable Function code deployed | yes |
| Microsoft Graph app registration | yes |
| Mail.Send permission configured | yes |
| Admin consent granted | yes |
| Exchange RBAC mailbox scope configured | yes |
| exposed setting remediation readiness | preflight complete, execution approval required |
| client secret/app credential readiness | no |
| Function Graph delivery settings configured | no |
| contact form production readiness | no |
| real email delivery readiness | blocked pending exposed setting remediation plus app credential/settings/redeploy/live-test approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Required Future Approval

Do not rotate keys or change settings without explicit approval.

Suggested execution approval:

```text
Approve Ice Function storage setting remediation execution only: rotate the exposed storage account key for iceforms20260605 without printing keys or connection strings, update only the existing Function app storage connection settings AzureWebJobsStorage, WEBSITE_CONTENTAZUREFILECONNECTIONSTRING, and AzureWebJobsDashboard for func-ice-static-contact-20260605, restart only if required, validate /api/static-contact in dry-run/no-email mode, and document the result. No email sending, no Microsoft 365 changes, no Graph app/RBAC changes, no CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production deployment, and Roller remains paused.
```

