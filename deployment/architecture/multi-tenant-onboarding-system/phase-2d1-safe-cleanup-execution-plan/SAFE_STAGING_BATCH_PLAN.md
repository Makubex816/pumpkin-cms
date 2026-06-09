# Safe Staging Batch Plan

## Rules For Every Batch

- Use only path-specific `git add --` commands.
- Do not use `git add -A`.
- Do not stage raw `content-review` inputs.
- Do not stage ignored generated output.
- Do not stage protected config files.
- Keep docs-only batches separate from source-code and static/Azure work.
- Run the verification block after each proposed batch and before each commit.

## Verification Block

Run after staging one proposed batch:

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --name-only | rg -n -i '(^content-review/|(^|/)\.env(\.|$)|appsettings\.Development\.json|local\.settings\.json|(^|/)\.tmp/|(^|/)node_modules/|(^|/)\.next/|(^|/)out/|(^|/)bin/|(^|/)obj/|(^|/)dist/)'
git diff --cached -U0 | rg -n -i '(bearer\s+[A-Za-z0-9._-]{20,}|eyJ[A-Za-z0-9._-]{20,}|api[_-]?key\s*[:=]\s*\S+|jwt\s*[:=]\s*\S+|secret\s*[:=]\s*\S+|token\s*[:=]\s*\S+|connectionstring\s*[:=]\s*\S+)'
```

The two `rg` commands should produce no output. If either produces output, stop and unstage the batch before deciding what to do.

## Batch 1: Phase 2D-1 Cleanup Execution Package

Purpose: commit only this Phase 2D-1 plan and root report.

```powershell
git add -- "PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2D1_SAFE_CLEANUP_EXECUTION_PLAN_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/phase-2d1-safe-cleanup-execution-plan/"
```

Suggested commit message:

```text
Plan safe onboarding cleanup execution
```

## Batch 2: Phase 2C-6 And Phase 2C-6A Blocker History

Purpose: preserve the read-only preflight and env-readiness blocker evidence separately from current cleanup planning.

```powershell
git add -- "PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6_ROLLER_CMS_READ_ONLY_PREFLIGHT_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/phase-2c6-roller-cms-read-only-preflight-result/" "PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2C6A_ROLLER_CMS_READ_ONLY_CURRENT_STATE_RETRY_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/phase-2c6a-roller-cms-read-only-current-state-retry-result/"
```

Suggested commit message:

```text
Record Roller read-only preflight blockers
```

## Batch 3: Phase 2A2 Validator Hardening Evidence

```powershell
git add -- "PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2A2_VALIDATOR_HARDENING_RESULT_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/phase-2a-validator-hardening-result/"
```

Suggested commit message:

```text
Record validator hardening evidence
```

## Batch 4: Phase 2B1 Builder Prototype Plan

```powershell
git add -- "PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2B1_BUILDER_PROTOTYPE_PLAN_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/phase-2b1-builder-prototype-implementation-plan/"
```

Suggested commit message:

```text
Plan import package builder prototype
```

## Batch 5: Phase 2B3 Builder Usability QA

```powershell
git add -- "PUMPKIN_MULTI_TENANT_ONBOARDING_PHASE_2B3_BUILDER_USABILITY_QA_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/phase-2b3-builder-usability-qa-result/"
```

Suggested commit message:

```text
Record builder usability QA
```

## Batch 6: Architecture QA Audit And Simulation

```powershell
git add -- "PUMPKIN_MULTI_TENANT_ONBOARDING_ARCHITECTURE_QA_AUDIT_REPORT.md" "deployment/architecture/multi-tenant-onboarding-system/architecture-qa-audit/" "deployment/architecture/multi-tenant-onboarding-system/audit-simulation/"
```

Suggested commit message:

```text
Record onboarding architecture QA audit
```

## Batch 7: User Help Walkthrough Doc

```powershell
git add -- "deployment/architecture/multi-tenant-onboarding-system/user-walkthrough/WHEN_TO_STOP_AND_ASK_FOR_HELP.md"
```

Suggested commit message:

```text
Add onboarding help escalation guide
```

## Not Yet Safe As Exact Batch

The large set of modified tracked onboarding architecture docs should not be staged in Phase 2D-1. They need a separate owner-reviewed path list because the current worktree also contains app source and static/Azure changes. A later docs-only pass may generate an exact tracked-file list with:

```powershell
git ls-files -m -- "deployment/architecture/multi-tenant-onboarding-system/" "PUMPKIN_MULTI_TENANT_ONBOARDING_ARCHITECTURE_REPORT.md"
```

Do not pipe that list into `git add` until the owner approves the exact output.
