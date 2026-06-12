# Blockers And Open Decisions

## Resolved In V2.8.2

- Missing `/service-areas` in Ice local seed source.
- Obsolete `/ice-rink-rentals` local seed page.
- Obsolete `/events-holiday-activations` local seed page.
- Obsolete Ice theme navigation.
- Static output route-shape validation failure.
- Static staging package route-shape validation failure.

## Remaining Not Ready

| Area | State |
| --- | --- |
| Deployment | not approved |
| DNS | not approved |
| Indexing | not approved |
| Live publication | not approved |
| Content maturity | static source validation still reports workflow/revision/template/fulfillment/form/service-schema quality warnings |
| Protected config caveat | Next build auto-detected `.env.local`; no manual read/print occurred |
| CMS snapshot freshness | no live CMS/API refresh was performed |
| Static form endpoint | public endpoint contract validated locally; no live endpoint HTTP check was run |

## Open Decisions

- Whether V2.8.3 should create a sanitized no-dotenv build harness before any staging approval worksheet.
- Whether to run a fresh approved non-secret static form endpoint verification or carry forward the 2026-06-06 proof.
- Whether to address content-maturity warnings before a staging publish approval worksheet.
- Whether to create a current Backup Center pre-publish backup candidate before staging deployment approval.
