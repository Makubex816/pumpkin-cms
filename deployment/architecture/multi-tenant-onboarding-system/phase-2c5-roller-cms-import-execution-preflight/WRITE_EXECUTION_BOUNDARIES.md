# Write Execution Boundaries

CMS import execution is not approved by Phase 2C-5. The boundaries below define what a later approval would need to allow explicitly.

## Future CMS Draft/Preview Writes That May Be Approved Later

- Create or verify a Roller tenant shell in draft/preview CMS scope.
- Create or verify a Roller site shell in draft/preview CMS scope.
- Import draft/preview route allowlist and forbidden-route blocks.
- Import draft/preview pages for `/`, `/contact`, and `/service-areas`.
- Import form definitions with `no-email`, `leadRecipientRef`, and legacy `recipientGroup` compatibility.
- Import SEO metadata with `noindex,nofollow` and sitemap disabled until final gate.
- Import theme/navigation settings.
- Import redirect metadata if present.
- Capture created or updated CMS IDs.
- Write a redacted CMS import evidence report.

## Still Excluded From Any CMS Import Execution Gate

- MediaAsset binary writes or uploads.
- Static generation.
- Deployment.
- Azure, Cloudflare, DNS, or Function App setting changes.
- Email delivery or Microsoft 365 changes.
- Search Console, sitemap submission, URL Inspection, indexing requests, or indexing monitoring.
- External HTTP checks outside the approved CMS read/write endpoint.
- Production readiness execution.
- Live-page publication.

## Write Safety Rules

- The future approval must name Roller Rink Rentals, exact package path, CMS scope, evidence output path, rollback owner, and hard stop.
- The importer must default to no-write mode unless an explicit execution flag and approval identifier are supplied.
- Any unexpected existing Roller records must pause execution before writes.
- Writes must be tenant-scoped and must not touch unrelated tenants.
- If a write partially succeeds, stop, capture IDs, and request rollback approval.
