# Readiness Gate

This gate decides whether a selected real tenant candidate is ready for the first local dry-run approval.

## Current Phase Classification

| Area | Status |
| --- | --- |
| Phase 2C-1 real tenant pilot planning | complete |
| Phase 2C-2 dry-run approval package | complete |
| Ready for first real tenant dry-run approval | yes, after this package is completed for one candidate |
| Ready for real tenant execution | no |
| New tenant created | no |
| External systems changed | no |
| Search Console or indexing affected | no |
| Roller | paused |

## Required Before First Real Dry-Run Approval

- Candidate selection worksheet is complete.
- Candidate recommendation is `go` or `go_with_notes`.
- User-facing intake checklist is complete.
- No-secrets agreement is acknowledged.
- Required information worksheet is complete.
- Owner review before generation is complete.
- Intake path is known.
- Future local answers path is known.
- Future local output path is known.
- Builder and validator test commands are planned before generation.
- Roller is explicitly confirmed paused.
- Exact approval wording is filled in.

## Required Before Real Tenant Execution

Real tenant execution remains blocked.

Before any later execution, the user must separately approve the exact tenant, action, systems allowed to change, systems excluded from change, evidence path, rollback owner, and rollback target.

## Hard Stops That Remain Closed

- CMS import
- tenant creation
- MediaAsset writes
- Azure changes
- Cloudflare changes
- DNS changes
- deployment
- Function App settings
- email or Microsoft 365 work
- Search Console
- sitemap submission
- URL Inspection
- indexing request
- indexing monitoring
- external HTTP checks
- protected config reads
- Roller work
