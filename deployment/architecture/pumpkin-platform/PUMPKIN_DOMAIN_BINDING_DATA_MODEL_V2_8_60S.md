# Pumpkin Domain Binding Data Model V2.8.60S

Status: design complete.

Recommended model:

- `DomainBinding`
- partition key `/tenantId`

The model should be a sidecar ledger and should not replace Tenant, Page, PublishRun, MediaAsset, FormDefinition, Theme, ImportRun, or User records.

Core sections:

- identity: id, tenantId, siteKey, domain, wwwDomain, canonical flag.
- provider: DNS mode, hosting target, target app/resource metadata.
- DNS packet: expected records, observed records, packet version, validation status.
- Azure binding: hostname binding, managed certificate, TLS status.
- runtime proof: routes, status, checked time, summary.
- promotion: canonical status, previous canonical, promoter.
- rollback: status, target, reason, timestamps.
- audit: append-only events.

Compatibility rules:

- Existing tenant package `domains.json` remains intake metadata.
- Existing `Tenant.settings.allowedOrigins` remains CORS configuration.
- Existing page canonical metadata is updated only after promotion in a later approved phase.
- Existing external Pumpkin CMS contracts are extended, not swapped.

