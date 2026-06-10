# Data Model Implementation Plan

## Contract Source

Phase 2H-3 should treat JSON schemas in `deployment/architecture/outbound-link-manager/schemas/` as authoritative.

Initial implementation records:

- `OutboundLink`
- `OutboundLinkInstance`
- `OutboundLinkPolicy`
- `OutboundLinkScanRun`
- `OutboundLinkAuditLog`

## ID Strategy

Local scanner should use deterministic ids derived from:

- tenant id;
- site id;
- normalized URL for links;
- link id plus location path for instances;
- timestamp or supplied run id for scan runs.

Do not use database ids in local fixtures.

## Tenant/Site Fields

Local records should use the architecture field names:

- `tenant_id`
- `site_id`

Future runtime adapters may map these to `tenantKey` and `siteKey` if required by existing CMS contracts.

## Status Validation

Implement enums exactly as 2H-1 defines them. Unknown status values fail validation.

## Future Persistence

No persistence migration in 2H-3. Future 2H-4 may add local file persistence first, then a later migration plan for Cosmos or the selected provider.
