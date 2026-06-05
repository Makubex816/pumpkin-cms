# Pumpkin Ice Static Form Endpoint Readiness Preflight Report

Date: 2026-06-05

Branch: feature/admin-page-editor-import-export

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Goal

Diagnose the remaining Ice strict static/staging form endpoint validator errors and prepare the safest implementation plan without deploying an endpoint or touching email, Microsoft 365, Azure resources, CMS, MediaAsset records, Cloudflare, static deployment, protected config, or Roller.

## Current Validator Status

Fresh local export:

```text
npm run export:static:ice:cms
exit 0
```

Validators:

| Validator | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | passed with form-readiness warnings |
| strict static output validator | 1 | fails only on 2 form endpoint errors |
| strict staging package validator | 1 | fails only on 2 form endpoint errors |

Remaining strict errors:

- `Static form endpoint is not configured for production/static deploy readiness.`
- `Static form endpoint/backend verification is missing; mailbox readiness is not app form readiness.`

Media output remains clean:

```text
local /media/ice-rink-rentals occurrences: 0
latestSnapshot mentions: 0
rendered local img src occurrences: 0
```

## Exact Requirements

The validators and static frontend read the endpoint URL from:

1. `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
2. `STATIC_FORM_ENDPOINT`
3. `NEXT_PUBLIC_STATIC_FORM_ACTION`
4. `STATIC_FORM_ACTION`

The endpoint URL must be a real HTTPS URL, not localhost or a placeholder. Backend readiness additionally requires:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

That flag must be set only after endpoint/backend verification passes.

## Recommendation

Use the existing local endpoint foundation:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Recommended future path: deploy/configure it later as an Ice-only hardened endpoint, preferably at:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility path if using the current wrapper unchanged:

```text
https://<approved-form-endpoint-host>/api/contact
```

Preflight finding to address before deployment: the frontend sends `staticEndpointRef` and `leadRecipientRef`; the existing endpoint handler currently reads `domainRoutingKey` and `recipientGroup`. Future execution should map or align those names so routing metadata is preserved exactly.

## Readiness

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static output quality gates | no |
| contact form production readiness | no |
| form endpoint execution readiness | pending explicit approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Result Package

Created:

```text
deployment/azure/ice-static-form-endpoint-readiness-preflight/
```

No endpoint was deployed, no email was sent, no Microsoft 365 changes occurred, no Azure resources were created, no CMS or MediaAsset writes occurred, no Cloudflare changes occurred, no static deployment occurred, no protected config was read, no secrets were printed, and Roller remained paused.

