# Safe To Stage Later List

This checkpoint did not stage anything. These paths appear safe to stage later only after targeted review, JSON parse where applicable, secret/path scan, and human confirmation.

## Committed In Latest Milestone

Already committed in `76a1c2b Record Roller CMS read-only current-state evidence`:

- `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C5_ROLLER_CMS_IMPORT_EXECUTION_PREFLIGHT_REPORT.md`
- `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6B_ROLLER_CMS_READ_ONLY_CURRENT_STATE_ENV_READY_REPORT.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c5-roller-cms-import-execution-preflight/`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c6b-roller-cms-read-only-current-state-env-ready-result/`

## Safe Future Docs Batches

| Batch | Paths |
| --- | --- |
| Architecture QA audit | `PUMPKIN_MULTI_TENANT_ONBOARDING_ARCHITECTURE_QA_AUDIT_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/architecture-qa-audit/`, `deployment/architecture/multi-tenant-onboarding-system/audit-simulation/` |
| Phase 2A evidence | `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2A2_VALIDATOR_HARDENING_RESULT_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/phase-2a-validator-hardening-result/` |
| Phase 2B1 plan | `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2B1_BUILDER_PROTOTYPE_PLAN_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/phase-2b1-builder-prototype-implementation-plan/` |
| Phase 2B3 QA | `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2B3_BUILDER_USABILITY_QA_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/phase-2b3-builder-usability-qa-result/` |
| Phase 2C-6 blocker history | `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6_ROLLER_CMS_READ_ONLY_PREFLIGHT_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/phase-2c6-roller-cms-read-only-preflight-result/` |
| Phase 2C-6A blocker history | `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6A_ROLLER_CMS_READ_ONLY_CURRENT_STATE_RETRY_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/phase-2c6a-roller-cms-read-only-current-state-retry-result/` |
| User walkthrough update | `deployment/architecture/multi-tenant-onboarding-system/user-walkthrough/WHEN_TO_STOP_AND_ASK_FOR_HELP.md` |
| Phase 2D-0 checkpoint | `PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2D0_REPO_HYGIENE_CLEANUP_CHECKPOINT_REPORT.md`, `deployment/architecture/multi-tenant-onboarding-system/phase-2d0-repo-hygiene-cleanup-checkpoint/` |

## Modified Architecture Docs

The modified architecture docs under `deployment/architecture/multi-tenant-onboarding-system/` appear related to onboarding documentation hardening. Stage later only as a reviewed architecture-docs batch, not mixed with raw inputs, generated output, app source changes, or static/Azure backlog work.

## Required Pre-Stage Checks

- Use path-specific staging, never `git add -A`.
- Parse changed JSON manifests.
- Run a targeted secret scan against staged diff.
- Confirm no ignored `.tmp`, static output, raw content-review input, or protected config path is staged.
- Keep code/source changes separate from docs-only batches.
