# Real Tenant Dry-Run Scope

## Purpose

The first real tenant dry run should prove that one selected business can move from approved non-secret intake into a local import package candidate, offline validation report, and redacted support packet.

This Phase 2C-2 package prepares the approval materials for that future dry run. It does not run the dry run now.

## Future Dry Run May Allow

Only after a later exact approval, the operator may:

- use the candidate's approved non-secret business and domain information
- prepare a local non-secret answers JSON file
- run the builder dry-run preview
- generate a local import package candidate
- run the offline validator
- generate validation reports
- generate a redacted support packet
- prepare operator handoff notes
- review the package with the owner

## Future Dry Run Must Not Allow

- real tenant creation
- CMS writes
- MediaAsset writes
- Azure changes
- Cloudflare changes
- DNS changes
- deployment
- Function App setting changes
- email sending
- Microsoft 365 changes
- Search Console submission
- sitemap submission
- URL Inspection usage
- indexing request
- indexing monitoring setup
- external HTTP checks
- protected config reads
- Roller work

## Stop Point

The later dry run stops after local package, validation, support packet, owner review, and operator handoff artifacts exist.

Any CMS import, deployment planning, external check, email test, DNS change, Cloudflare change, Azure change, Search Console action, indexing request, or Roller work requires a separate future approval.
