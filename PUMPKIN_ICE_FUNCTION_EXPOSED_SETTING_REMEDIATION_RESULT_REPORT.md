# Pumpkin Ice Function Exposed Setting Remediation Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice Azure Function exposed storage setting remediation execution only.

No secret values, storage keys, connection strings, tokens, client secrets, or credentials were printed or written to repo files. No real email was sent. No Microsoft 365 changes were made. No Graph app/RBAC changes were made. No client secret or certificate was created. No endpoint code was redeployed. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. Roller remains paused.

## Result

Remediation completed.

| Check | Result |
| --- | --- |
| Storage account | `iceforms20260605` |
| Function App | `func-ice-static-contact-20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| Previously referenced/exposed key name | `key1` |
| Alternate key name used for Function settings | `key2` |
| App settings updated | yes |
| Storage key rotated | yes |
| Rotated key name | `key1` |
| Both keys rotated | no |
| Explicit Function restart command run | no |
| Endpoint redeployed | no |
| Dry-run/no-email confirmed after remediation | yes |

## Settings Updated

Only these approved Function App settings were updated:

- `AzureWebJobsStorage`
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
- `AzureWebJobsDashboard`

Readback after rotation confirmed all three settings are present, have values, and match `key2` by in-memory comparison only.

Graph delivery settings were not added. Graph mode remains inactive.

## Endpoint Health

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

All health suites passed:

| Phase | OPTIONS | Valid dry-run payload | Invalid email | Unknown route/recipient | Honeypot | Response secret-pattern scan |
| --- | --- | --- | --- | --- | --- | --- |
| pre-change | 204 | 200 | 400 | 400 | 400 | clean |
| after switching settings to `key2` | 204 | 200 | 400 | 400 | 400 | clean |
| after rotating `key1` | 204 | 200 | 400 | 400 | 400 | clean |

No real email was sent.

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
| exposed setting remediation | yes |
| client secret/app credential readiness | no |
| Function Graph delivery settings configured | no |
| contact form production readiness | no |
| real email delivery readiness | pending app credential/app settings/live-test approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Next Required Step

Separate approval is still required before real email delivery:

- create an approved app credential, certificate, Key Vault reference, or managed identity delivery path
- configure Azure Function Graph app settings
- activate Graph delivery mode
- restart or redeploy only if approved
- send one approved live email test
- verify receipt and validator transition

