# Pumpkin Ice Static Form Endpoint Local Hardening Result Report

Date: 2026-06-05

Branch: feature/admin-page-editor-import-export

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Goal

Locally harden the existing static form endpoint package so it accepts the current frontend payload fields `staticEndpointRef` and `leadRecipientRef`, maps them to the endpoint handler routing fields, preserves legacy payload compatibility, adds tests/docs, and prepares future deployment instructions.

## Result

Completed within the approved local hardening scope.

Changed package:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Key result:

- `staticEndpointRef` maps to `domainRoutingKey` when `domainRoutingKey` is absent
- `leadRecipientRef` maps to `recipientGroup` when `recipientGroup` is absent
- legacy `domainRoutingKey` and `recipientGroup` still work and take precedence
- unknown routing/recipient refs are rejected without echoing submitted values
- local tests cover frontend payloads, legacy payloads, missing fields, invalid fields, honeypot, oversized message, and sanitized mocked backend forward

## Tests

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
npm test
```

Both exited `0`.

## Readiness

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| static form endpoint local hardening | yes |
| contact form production readiness | no |
| static output quality gates | no |
| endpoint deployment readiness | pending explicit approval |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Result Package

Created:

```text
deployment/azure/ice-static-form-endpoint-local-hardening-result/
```

No endpoint was deployed, no email was sent, no Microsoft 365 changes occurred, no Azure resources were created, no CMS or MediaAsset writes occurred, no Cloudflare changes occurred, no static deployment occurred, no protected config was read, no secrets were printed, and Roller remained paused.

