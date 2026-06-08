# Next CMS Import Planning Approval Required

CMS import planning is now the next possible planning gate, but it is not approved by Phase 2C-3A.

## Current Decision

Status: `planning_approval_required`

The local Roller package exists and passed offline validation. A separate approval is required before planning CMS import.

## CMS Import Planning Approval Must Name

- tenant: Roller Rink Rentals
- generated package path
- validation report path
- support packet path
- CMS scope to plan
- systems allowed for planning
- systems excluded from planning
- rollback owner
- evidence path
- hard stop before live pages

## Still Not Authorized

- CMS import
- CMS writes
- MediaAsset writes
- tenant creation
- Azure changes
- Cloudflare changes
- DNS changes
- deployment
- Function App settings
- email or Microsoft 365 work
- Search Console or indexing
- external checks
- live-page publication

## Suggested Future Approval Shape

```text
Approve Roller CMS import planning only: review the local Roller import package at <package path>, validation report at <validation report path>, and support packet at <support packet path>; define the CMS preview import plan and rollback owner. No CMS writes, no tenant creation, no Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no secrets, and hard stop before live pages.
```
