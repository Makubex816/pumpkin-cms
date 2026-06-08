# No-Mutation Dry-Run Plan

This plan is for a future separately approved real tenant dry run. It is not authorization to run the dry run now.

## Preconditions

- Phase 2B-5 form recipient alignment is complete.
- Builder tests pass locally.
- Validator tests pass locally.
- The fake pilot result has no unresolved blocker that affects real-tenant dry runs.
- The candidate meets the selection criteria.
- The owner supplies approved non-secret intake.
- The user explicitly approves the future real tenant no-mutation dry run.
- Roller remains paused unless a separate Roller-specific approval says otherwise.

## Future Dry-Run Sequence

1. Create a working folder under a local ignored path such as `.tmp/real-tenant-pilots/<tenant-slug>/`.
2. Convert the approved intake into a non-secret answers JSON file.
3. Run the builder in preview or dry-run mode to inspect planned output.
4. Generate the local import package candidate.
5. Run the offline validator against the generated package.
6. Export validation reports and a redacted support packet.
7. Review generated routes, media references, form recipient references, SEO fields, owner contacts, approval states, and hard stops.
8. Have the operator complete `OPERATOR_REVIEW_CHECKLIST.md`.
9. Have the owner review content, legal/privacy status, form oversight, analytics decision, monitoring owner, rollback owner, and final indexing hard stop.
10. Stop.

## Example Future Commands

These commands are examples for a later approved dry run and must be adjusted to the final answers path and output folder.

```powershell
Set-Location deployment/architecture/multi-tenant-onboarding-system/import-package-builder
node src/builder-cli.mjs --answers .tmp/real-tenant-pilots/<tenant-slug>/answers.json --out .tmp/real-tenant-pilots/<tenant-slug>/preview --dry-run --validate --support-packet
node src/builder-cli.mjs --answers .tmp/real-tenant-pilots/<tenant-slug>/answers.json --out .tmp/real-tenant-pilots/<tenant-slug>/candidate --overwrite --validate --support-packet
```

## Required Outputs

- local non-secret answers file
- local import package candidate
- `validation-report.json`
- human-readable validation report
- redacted support packet
- operator checklist result
- owner review status
- gap list for later planning

## Hard Stop

The dry run ends with local review artifacts. It does not continue into CMS import, tenant creation, deployment profile execution, DNS, Cloudflare, Azure, email, Search Console, sitemap submission, indexing request, or monitoring setup.
