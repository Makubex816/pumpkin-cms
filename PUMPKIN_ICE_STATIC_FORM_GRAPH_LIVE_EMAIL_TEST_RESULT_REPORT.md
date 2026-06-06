# Pumpkin Ice Static Form Graph Live Email Test Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice Graph live email test only.

No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No production website was deployed. No root/www DNS changes were made. No Microsoft 365 permission/RBAC changes were made. No app registration changes were made. No client secret was created. No endpoint code was redeployed. No protected local config was read. Roller remains paused.

No secret values, tokens, storage keys, connection strings, client secrets, API keys, or credentials were printed or written to repo files.

## Result

Exactly one live valid payload was submitted while `FORM_DELIVERY_MODE=graph`.

| Check | Result |
| --- | --- |
| Function App | `func-ice-static-contact-20260605` |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Changed setting | `FORM_DELIVERY_MODE` only |
| Pre-test mode | `no-email` |
| Test mode | `graph` |
| Valid live payload attempts | `1` |
| Submitted at UTC | `2026-06-06T02:53:16.896Z` |
| Test run id | `ice-graph-live-20260606025316` |
| Endpoint status | `200` |
| Endpoint response `ok` | true |
| Endpoint entry id present | true |
| Response secret-pattern scan | clean |
| Post-test mode | `no-email` |

The endpoint returned success. In this endpoint code path, success from Graph mode requires Microsoft Graph `sendMail` to return `202 Accepted`; otherwise the handler returns an error.

## Delivery Evidence

Read-only Exchange message trace metadata found one matching message:

| Field | Value |
| --- | --- |
| Sender | `Contact@iceskatingrinkrentals.com` |
| Recipient | `Contact@iceskatingrinkrentals.com` |
| Subject | `Ice rink rental lead: Ice Graph Delivery Test` |
| Status | `Delivered` |
| Message trace id | `94e8d3f8-748a-4a5e-2fb0-08dec376c3b7` |

Mailbox contents were not accessed. Human inbox confirmation is still recommended by checking the `contact@iceskatingrinkrentals.com` mailbox and junk/quarantine folders.

## Mode Decision

Graph mode was reverted to `FORM_DELIVERY_MODE=no-email` after the single live test.

Recommendation: keep `no-email` until a separate production enablement approval intentionally turns Graph mode on for ongoing form delivery. The live email path is proven by endpoint success and Exchange trace delivery, but production readiness should still include human inbox confirmation and an explicit decision to keep the endpoint live.

## Health Checks

| Phase | OPTIONS | Invalid email | Unknown route/recipient | Honeypot | Valid live payload | Secret-pattern scan |
| --- | --- | --- | --- | --- | --- | --- |
| pre-test no-email | 204 | 400 | 400 | 400 | not run | clean |
| graph mode before send | not run | 400 | 400 | 400 | not run | clean |
| graph mode live send | not run | not run | not run | not run | 200 | clean |
| post-test no-email | 204 | 400 | 400 | 400 | not run | clean |

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
| client secret/app credential readiness | yes |
| Graph Function app settings readiness | yes |
| real email test sent | yes |
| Exchange trace delivery evidence | yes, `Delivered` |
| human inbox confirmation | pending |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Next Required Approval

Do not enable ongoing production Graph mode without explicit approval.

Suggested next approval:

```text
Approve Ice Graph production contact form enablement only: after human confirmation that the one-time test email is visible in contact@iceskatingrinkrentals.com, set func-ice-static-contact-20260605 FORM_DELIVERY_MODE=graph for ongoing production contact form delivery, run strict safe validators without sending additional unapproved emails, document production readiness, and keep rollback to FORM_DELIVERY_MODE=no-email ready. No CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production website deployment, no root/www DNS changes, and Roller remains paused.
```

