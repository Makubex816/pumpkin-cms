# Pumpkin Ice Static Form Production Enablement Preflight Report

Generated: 2026-06-06

## Scope

Approved action: Ice static form production enablement preflight only.

No Function App settings were changed. `FORM_DELIVERY_MODE` was not set to `graph`. `STATIC_FORM_ENDPOINT_VERIFIED=true` was not set. No email was sent. No endpoint was deployed. No Azure resources were created. No Microsoft 365 changes were made. No CMS writes occurred. No MediaAsset writes occurred. No Cloudflare changes were made. No static site was deployed. No production website was deployed. No protected config was read. Roller remains paused.

## Graph Live Test Review

The Graph live email test is technically successful:

| Check | Result |
| --- | --- |
| valid live payload attempts | `1` |
| submitted at UTC | `2026-06-06T02:53:16.896Z` |
| endpoint status | `200` |
| endpoint response | `ok=true`, entry id present |
| Exchange trace status | `Delivered` |
| subject | `Ice rink rental lead: Ice Graph Delivery Test` |
| message trace id | `94e8d3f8-748a-4a5e-2fb0-08dec376c3b7` |
| final Function mode after test | `FORM_DELIVERY_MODE=no-email` |

Mailbox contents were not accessed. Human inbox confirmation is still required before ongoing production sending is enabled.

## Human Confirmation Gate

Before production enablement, the user must confirm:

- the message with subject `Ice rink rental lead: Ice Graph Delivery Test` is visible in `contact@iceskatingrinkrentals.com`
- the message content looks safe and sanitized
- no duplicate or unexpected test messages were received
- junk/quarantine were checked if the message is not in the primary inbox

No additional email should be sent for this confirmation.

## Production Settings Contract

Future production Function App setting decision:

```text
FORM_DELIVERY_MODE=graph
```

Future public static/validator endpoint URL:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Preferred static build variable:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Optional validator/compatibility aliases, same public URL if used:

```text
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
NEXT_PUBLIC_STATIC_FORM_ACTION=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ACTION=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Verification flag, only after human confirmation and explicit enablement approval:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Required server-side Graph settings are already staged in the Function App by name, but secret values are not documented here.

## Validator Plan

After the next explicit approval:

1. confirm the inbox message
2. set `FORM_DELIVERY_MODE=graph`
3. provide `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or an approved alias to the static export/validator shell
4. set `STATIC_FORM_ENDPOINT_VERIFIED=true` only in the approved validation/deploy context
5. rerun Ice static export
6. rerun strict static output validator
7. rerun strict staging package validator
8. if all pass, update readiness

Expected remaining form endpoint validator errors after the approved enablement context is configured:

```text
none
```

## Readiness Classification

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form endpoint local hardening | yes |
| static form Function scaffold readiness | yes |
| Graph live email delivery proof | yes |
| contact form production readiness | no |
| production form enablement readiness | pending human inbox confirmation and explicit approval |
| static output quality gates | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Next Approval

Suggested approval:

```text
Approve Ice static form production enablement only: after confirming the one-time Graph test email is visible in contact@iceskatingrinkrentals.com with safe content and no duplicate messages, set func-ice-static-contact-20260605 FORM_DELIVERY_MODE=graph, configure the approved static export/validator environment with NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact and STATIC_FORM_ENDPOINT_VERIFIED=true, rerun Ice static export and strict validators, document readiness, and keep rollback to FORM_DELIVERY_MODE=no-email ready. No CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production website deployment, no root/www DNS changes, and Roller remains paused.
```

