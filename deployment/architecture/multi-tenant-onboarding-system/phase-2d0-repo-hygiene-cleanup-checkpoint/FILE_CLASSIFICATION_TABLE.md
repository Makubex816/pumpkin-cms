# File Classification Table

## A. Expected Onboarding Docs And Reports

| Path Pattern Or Group | Status | Recommendation |
| --- | --- | --- |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_ARCHITECTURE_REPORT.md` | modified | review/stage with architecture doc batch later |
| `deployment/architecture/multi-tenant-onboarding-system/**/*.md` | modified | review/stage with onboarding architecture batch later |
| `deployment/architecture/multi-tenant-onboarding-system/**/*.json` | modified | parse and stage with matching docs only after review |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_ARCHITECTURE_QA_AUDIT_REPORT.md` | untracked | safe to stage later after report validation |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2A2_VALIDATOR_HARDENING_RESULT_REPORT.md` | untracked | safe to stage later after report validation |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2B1_BUILDER_PROTOTYPE_PLAN_REPORT.md` | untracked | safe to stage later after report validation |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2B3_BUILDER_USABILITY_QA_REPORT.md` | untracked | safe to stage later after report validation |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6_ROLLER_CMS_READ_ONLY_PREFLIGHT_REPORT.md` | untracked | safe to stage later if preserving blocker history |
| `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6A_ROLLER_CMS_READ_ONLY_CURRENT_STATE_RETRY_REPORT.md` | untracked | safe to stage later if preserving blocker history |
| `deployment/architecture/multi-tenant-onboarding-system/architecture-qa-audit/` | untracked | safe to stage later with matching root report |
| `deployment/architecture/multi-tenant-onboarding-system/audit-simulation/` | untracked | safe to stage later with architecture QA package |
| `deployment/architecture/multi-tenant-onboarding-system/phase-2a-validator-hardening-result/` | untracked | safe to stage later with Phase 2A report |
| `deployment/architecture/multi-tenant-onboarding-system/phase-2b1-builder-prototype-implementation-plan/` | untracked | safe to stage later with Phase 2B1 report |
| `deployment/architecture/multi-tenant-onboarding-system/phase-2b3-builder-usability-qa-result/` | untracked | safe to stage later with Phase 2B3 report |
| `deployment/architecture/multi-tenant-onboarding-system/phase-2c6-roller-cms-read-only-preflight-result/` | untracked | safe to stage later if preserving Phase 2C-6 blocker evidence |
| `deployment/architecture/multi-tenant-onboarding-system/phase-2c6a-roller-cms-read-only-current-state-retry-result/` | untracked | safe to stage later if preserving Phase 2C-6A blocker evidence |
| `deployment/architecture/multi-tenant-onboarding-system/user-walkthrough/WHEN_TO_STOP_AND_ASK_FOR_HELP.md` | untracked | safe to stage later with user walkthrough docs |

## B. Expected Ignored Generated Output

| Path Pattern Or Group | Status | Recommendation |
| --- | --- | --- |
| `deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/` | ignored | do not stage; delete only with explicit cleanup approval |
| `deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/` | ignored | do not stage; delete only with explicit cleanup approval |
| `.static-release-dry-runs/` | ignored | do not stage; delete only with explicit cleanup approval |
| `apps/ice-rink-web/.static-artifacts/` | ignored | do not stage; delete only with explicit cleanup approval |
| `apps/ice-rink-web/.static-content-snapshots/` | ignored | do not stage; delete only with explicit cleanup approval |
| `apps/*/.next/`, `apps/ice-rink-web/out/` | ignored | do not stage; delete only with explicit cleanup approval |
| `node_modules/`, `bin/`, `obj/`, `dist/` outputs | ignored | do not stage; normal generated/dependency output |

## C. Raw Content-Review Input Folders

| Path | Status | Recommendation |
| --- | --- | --- |
| `content-review/ice-final-contact-input/` | untracked | do not stage; do not delete; separate content-ingestion workflow |
| `content-review/ice-service-areas-input/` | untracked | do not stage; do not delete; separate content-ingestion workflow |

## D. Static Azure / Backlog Folders Unrelated To Current Cleanup

| Path Pattern Or Group | Status | Recommendation |
| --- | --- | --- |
| `deployment/static-azure/*.md` | modified | leave unstaged until separate static/Azure review |
| `deployment/static-azure/*.mjs` | modified | leave unstaged until separate static/Azure code review |
| `deployment/azure/ice-static-form-real-email-delivery-preflight/*.md` | modified | leave unstaged until separate Azure/form endpoint review |

## E. Potential Secret / Protected Config Risk

| Path | Status | Recommendation |
| --- | --- | --- |
| `apps/ice-rink-web/.env.local` | ignored | protected; do not read, stage, or modify |
| `apps/pumpkin-api/appsettings.Development.json` | ignored | protected; do not read, stage, or modify |
| Any path containing `jwt`, `token`, `secret`, `api_key`, `api-key`, `auth`, `credential` | path-risk scan only | do not read contents unless separately approved and known non-secret |

## F. Accidental Generated Artifacts

| Path | Status | Recommendation |
| --- | --- | --- |
| `tatus --short` | untracked | likely accidental command-output artifact; explicit delete approval required |
| Raw zip/extracted folders under `content-review/` | untracked | raw input artifacts; do not delete in this checkpoint |

## G. Files Safe To Stage Later

Safe only after targeted review and secret/path validation:

- untracked onboarding docs and result packages
- modified onboarding architecture docs
- Phase 2D-0 report package and root report

## H. Files That Must Not Be Staged

- ignored generated output
- raw `content-review` inputs
- protected config files
- dependency/build output
- static export/snapshot/dry-run artifacts

## I. Files Requiring Explicit Delete Approval

- `tatus --short`
- stale `.tmp` generated outputs
- stale `.static-release-dry-runs/`
- stale `.next/`, `out/`, `bin/`, `obj/`, `dist/`, and `node_modules/`
- raw zip/extracted content-review input duplicates, if a future content-ingestion owner approves removal

## J. `.gitignore` Candidates

No urgent `.gitignore` change is required for the observed generated output: the main build, dependency, static, protected config, and `.tmp` paths are already ignored. Consider a future explicit ignore rule for accidental root command-output artifacts only if they recur; do not add a broad ignore that hides meaningful reports.
