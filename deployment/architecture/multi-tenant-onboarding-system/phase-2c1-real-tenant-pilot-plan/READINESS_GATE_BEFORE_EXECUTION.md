# Readiness Gate Before Execution

This document separates readiness for a future no-mutation dry-run approval from readiness for real execution.

## Current Classification

| Area | Classification |
| --- | --- |
| Phase 2B-5 form recipient alignment | complete |
| Phase 2C-1 real tenant pilot planning | yes |
| Ready for real tenant dry-run approval | yes, conditional on approved non-secret candidate intake and passing local builder/validator checks before the dry run |
| Ready for real tenant execution | no |
| New tenant created | no |
| External systems changed | no |
| Search Console or indexing affected | no |
| Roller | paused |

## Required Before Future Dry-Run Approval

- Phase 2B-5 form recipient alignment is present and not reverted.
- Builder tests pass.
- Validator tests pass.
- Fake pilot evidence has no unresolved blocker affecting real tenant package generation.
- Candidate meets first-pilot selection criteria.
- User supplies approved non-secret candidate intake.
- User acknowledges no secrets should be supplied.
- User explicitly approves the no-mutation dry run.
- Roller status is explicitly confirmed as paused unless the candidate is separately approved for Roller-specific work.

## Required Before Any Real Execution

Real execution is not ready.

Before any later CMS import, deployment, external check, email test, DNS change, Cloudflare change, Azure change, Search Console action, or indexing request, there must be a separate approval that names:

- tenant
- exact action
- allowed systems
- excluded systems
- evidence path
- rollback owner
- rollback target
- whether secrets may be used at runtime without being printed

## Final Indexing Hard Stop

Search Console, sitemap submission, URL Inspection, indexing request, and indexing monitoring remain blocked until final owner approval exists after production smoke and human review gates are complete.
