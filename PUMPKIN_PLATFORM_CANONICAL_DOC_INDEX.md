# Pumpkin Platform Canonical Doc Index

This is the canonical index for current platform navigation. Historical docs remain valuable, but current work should start here.

## Top-Level Control Docs

| Doc | Purpose |
| --- | --- |
| `PUMPKIN_PLATFORM_SOURCE_OF_TRUTH.md` | Current canonical platform state |
| `PUMPKIN_PLATFORM_TRACKER.md` | Current tracker and percentage model |
| `PUMPKIN_PLATFORM_CANONICAL_DOC_INDEX.md` | Current canonical doc/result-package index |
| `PUMPKIN_PLATFORM_ACTIVE_BLOCKERS_AND_GATES.md` | Active hard stops and safety gates |
| `PUMPKIN_PLATFORM_SOURCE_OF_TRUTH_CONTROL_LAYER_REPORT.md` | SOT-01 root report |

## Latest Canonical Result Packages

| Area | Latest package | Status |
| --- | --- | --- |
| Platform source of truth | `deployment/architecture/platform-source-of-truth/phase-sot01-pumpkin-platform-source-of-truth-control-layer-result/` | Current |
| OLM staging target/resource SOT binding | `deployment/architecture/outbound-link-manager/phase-2h24-olm-staging-target-resource-foundation-sot-binding-result/` | Current OLM package |
| OLM hardening closure | `deployment/architecture/outbound-link-manager/phase-2h23b-olm-hardening-completion-staging-target-profile-closure-result/` | Current support proof |
| Backup Generator QA | `deployment/architecture/pumpkin-backup-export-restore/phase-2f14-backup-generator-qa-signoff-result/` | Current Backup Center signoff |
| Resource Registry live inventory | `deployment/architecture/pumpkin-backup-export-restore/phase-2f12n-real-resource-registry-live-inventory-result/` | Current redacted registry inventory |
| Runtime QA staging gate | `deployment/architecture/outbound-link-manager/phase-2h21-runtime-qa-provider-readiness-staging-gate-result/` | Current runtime QA pattern evidence |
| OLM scoped execution package builder | `deployment/architecture/outbound-link-manager/phase-2h22-scoped-staging-execution-preflight-package-result/` | Current first-write package builder proof |

## Latest Canonical Root Reports

| Area | Report |
| --- | --- |
| Platform SOT | `PUMPKIN_PLATFORM_SOURCE_OF_TRUTH_CONTROL_LAYER_REPORT.md` |
| OLM staging target/resource SOT binding | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` |
| OLM hardening closure | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H23B_HARDENING_COMPLETION_STAGING_TARGET_PROFILE_CLOSURE_REPORT.md` |
| Backup Generator QA | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` |
| Runtime QA | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H21_RUNTIME_QA_PROVIDER_READINESS_STAGING_GATE_REPORT.md` |

## Historical But Useful Families

| Family | Use |
| --- | --- |
| `deployment/architecture/outbound-link-manager/phase-2h*/` | OLM phase history and implementation evidence |
| `deployment/architecture/pumpkin-backup-export-restore/phase-2f*/` | Backup Center, Resource Registry, Cosmos/media proof history |
| `deployment/architecture/multi-tenant-onboarding-system/` | Multi-tenant onboarding architecture and guardrails |
| `deployment/static-azure/` | Static export, staging, and deployment planning history |
| `deployment/azure/` | Azure staging/media/form endpoint preflight and result history |

## Docs To Treat Carefully

| Candidate | Reason |
| --- | --- |
| Root `README.md` configuration section | Older key-based placeholder examples are not the current safe operational source. |
| Older OLM packages before 2H-23B | Historical only unless a current SOT doc points to them. |
| Older Backup Center packages before 2F-14 | Historical proof chain; latest operator state is 2F-14. |
| Static/Azure staging docs before current gates | Historical unless refreshed by an approved staging phase. |
