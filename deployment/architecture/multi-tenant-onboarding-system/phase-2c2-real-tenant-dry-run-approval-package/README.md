# Phase 2C-2 Real Tenant Dry-Run Approval Package

This package contains the user-facing intake, no-secrets agreement, candidate worksheet, approval wording, and operator checklist required before generating the first real tenant import package.

It is an approval/intake package only. It does not generate a real tenant package, create a tenant, write CMS records, write MediaAsset records, modify Azure, modify Cloudflare, change DNS, deploy, change Function App settings, send email, use Microsoft 365, use Search Console, request indexing, run external checks, read protected config, or resume Roller.

## Status

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

## How To Use This Package

1. Use `CANDIDATE_SELECTION_WORKSHEET.md` to choose one simple first candidate.
2. Have the user complete `USER_FACING_INTAKE_CHECKLIST.md`.
3. Have the user acknowledge `NO_SECRETS_AGREEMENT.md`.
4. Use `REQUIRED_INFORMATION_WORKSHEET.md` to verify all needed non-secret facts are present.
5. Review `FORBIDDEN_INFORMATION_WARNING.md` before any answer file is created.
6. Complete `OWNER_REVIEW_BEFORE_GENERATION.md`.
7. Use `APPROVAL_WORDING_FOR_FIRST_REAL_DRY_RUN.md` or `NEXT_FIRST_REAL_DRY_RUN_PROMPT.md` for the later exact dry-run approval.
8. During the later approved dry run, use `DRY_RUN_OPERATOR_CHECKLIST.md`.

## Required Artifacts

- `REAL_TENANT_DRY_RUN_SCOPE.md`
- `CANDIDATE_SELECTION_WORKSHEET.md`
- `USER_FACING_INTAKE_CHECKLIST.md`
- `NO_SECRETS_AGREEMENT.md`
- `REQUIRED_INFORMATION_WORKSHEET.md`
- `FORBIDDEN_INFORMATION_WARNING.md`
- `DRY_RUN_OPERATOR_CHECKLIST.md`
- `APPROVAL_WORDING_FOR_FIRST_REAL_DRY_RUN.md`
- `OWNER_REVIEW_BEFORE_GENERATION.md`
- `ABORT_AND_ROLLBACK_RULES.md`
- `READINESS_GATE.md`
- `NEXT_FIRST_REAL_DRY_RUN_PROMPT.md`
- `manifest.json`

## Hard Boundary

Completing this package prepares a later approval. It does not authorize package generation by itself. The later approval must name the candidate, approved intake path, allowed local actions, excluded systems, and Roller boundary.
