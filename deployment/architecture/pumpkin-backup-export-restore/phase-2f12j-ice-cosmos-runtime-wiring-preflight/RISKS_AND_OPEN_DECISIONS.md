# Risks and Open Decisions

## Risks

- Runtime code might accidentally treat a provisioned future provider as active if profile gates are too loose.
- Metadata endpoint authorization must be verified before live use.
- RBAC and managed identity requirements remain unresolved for future runtime access.
- Seed and migration strategy is not yet defined.
- Backup proof for a Cosmos-backed Ice runtime does not exist yet.
- Public network and network access posture require future owner review.

## Open Decisions

- Which identity will the CMS runtime use for Cosmos access?
- Which identity will Backup Center use for read-only backup access?
- Which environment owns production runtime profile values?
- Which data source is the authoritative seed source for Ice?
- Should seed use direct provider migration, CMS export/import, or a purpose-built migration package?
- What exact readback counts are required before runtime switch planning?
- What backup proof is sufficient before live-page publication can resume?

## Current Recommendation

Proceed to a no-switch runtime profile implementation foundation only. Do not approve runtime switch, seed/migration, live connector execution, deployment, or live-page publication.

