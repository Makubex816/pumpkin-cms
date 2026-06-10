# API Service Boundaries

Future implementation should separate endpoints, orchestration, provider access, validation, and audit logging.

## Proposed API Layers

| Layer | Responsibility |
| --- | --- |
| Endpoint layer | Bind route parameters, query values, request bodies, auth context, and response status codes |
| Application service | Enforce tenant/site scope, role gates, operation mode, workflow sequencing, and audit requirements |
| Domain services | Normalize URLs/domains, apply policies, merge scan output, resolve statuses, and create render decisions |
| Provider layer | Read/write local JSON provider, future Cosmos provider, and future in-memory test provider |
| Validation layer | Validate request models, policy safety, bulk previews, scan sources, and render decisions |
| Integration adapters | Backup Center export, onboarding import, tenant bundle export, restore validation, and domain review output |

## Suggested Future Files

These are planning targets only:

- `apps/pumpkin-api/Services/OutboundLinks/OutboundLinkService.cs`
- `apps/pumpkin-api/Services/OutboundLinks/IOutboundLinkProvider.cs`
- `apps/pumpkin-api/Services/OutboundLinks/LocalOutboundLinkProvider.cs`
- `apps/pumpkin-api/Services/OutboundLinks/CosmosOutboundLinkProvider.cs`
- `apps/pumpkin-api/Services/OutboundLinks/OutboundLinkPolicyService.cs`
- `apps/pumpkin-api/Services/OutboundLinks/OutboundLinkAuditService.cs`
- `apps/pumpkin-api/Services/OutboundLinks/OutboundLinkBulkActionService.cs`
- `apps/pumpkin-api/Services/OutboundLinks/OutboundLinkScanRunService.cs`
- `apps/pumpkin-api/Services/OutboundLinks/OutboundLinkRenderDecisionService.cs`

## Boundary Rules

- Endpoints do not directly query Cosmos or local files.
- Provider implementations do not decide user permissions.
- Domain services do not read protected config.
- Scanner services never crawl external links unless a later phase explicitly approves that capability.
- Backup/onboarding/tenant bundle adapters are export/import contract adapters, not side-channel persistence layers.
- Rendering integration is read-only until a later production renderer gate is approved.

