# Pumpkin Ice Static Form Graph App Settings Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice Graph app credential and Function app settings setup only.

No real email was sent. No live production form submission was made. No endpoint code was redeployed. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No protected local config was read. Roller remains paused.

No client secret value, token, storage key, connection string, API key, email credential, or credential value was printed or written to repo files.

## Result

Completed.

| Check | Result |
| --- | --- |
| Existing app | `Ice Static Contact Form Mailer` |
| Application/client id | `423390e3-63ee-4c53-bc87-c87f59958f13` |
| Function App | `func-ice-static-contact-20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| Client credential created | yes |
| Password credential count after setup | `1` |
| Certificate/key credential count after setup | `0` |
| Graph Function app settings configured | yes |
| Endpoint Graph delivery active | no |
| No-send mode | `FORM_DELIVERY_MODE=no-email` |
| Function App state after setup | `Running` |

The endpoint package does not support a true Graph no-send mode. If `FORM_DELIVERY_MODE=graph` is active, valid submissions call Microsoft Graph `sendMail`. To preserve the no-email boundary, this pass staged the Graph credential/settings and set `FORM_DELIVERY_MODE=no-email`.

## Function App Settings

Configured setting names, value-present status only:

| Setting name | Present | Value present |
| --- | --- | --- |
| `FORM_DELIVERY_MODE` | yes | yes |
| `MICROSOFT_GRAPH_TENANT_ID` | yes | yes |
| `MICROSOFT_GRAPH_CLIENT_ID` | yes | yes |
| `MICROSOFT_GRAPH_CLIENT_SECRET` | yes | yes |
| `MICROSOFT_GRAPH_SENDER_USER` | yes | yes |
| `ICE_RINK_RENTALS_LEAD_RECIPIENT` | yes | yes |
| `MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS` | yes | yes |
| `FORM_EMAIL_REPLY_TO_MODE` | yes | yes |
| `FORM_EMAIL_SUBJECT_PREFIX` | yes | yes |

Readback status:

| Check | Result |
| --- | --- |
| Graph-related setting name count | `6` |
| `FORM_DELIVERY_MODE` no-email confirmed | yes |
| legacy `STATIC_FORM_FORWARD_MODE` dry-run still present | yes |
| Graph mode active | no |

## Safe Endpoint Health

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

| Phase | OPTIONS | Valid no-send payload | Invalid email | Unknown route/recipient | Honeypot | Response secret-pattern scan |
| --- | --- | --- | --- | --- | --- | --- |
| pre-settings | 204 | not run | 400 | 400 | 400 | clean |
| post-settings no-send | 204 | 200 | 400 | 400 | 400 | clean |

No real email was sent because Graph delivery mode remained inactive.

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
| client secret/app credential readiness | yes |
| Graph Function app settings readiness | yes, staged in no-send mode |
| contact form production readiness | no |
| real email delivery readiness | pending live-email test approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Next Required Approval

The next approval must explicitly allow the live email test. Recommended scope:

```text
Approve Ice Graph live email delivery test only: switch func-ice-static-contact-20260605 from FORM_DELIVERY_MODE=no-email to FORM_DELIVERY_MODE=graph, submit exactly one safe approved /api/static-contact test payload, verify Microsoft Graph sendMail acceptance and mailbox receipt, then document the result and rollback path. No CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production deployment, and Roller remains paused.
```

