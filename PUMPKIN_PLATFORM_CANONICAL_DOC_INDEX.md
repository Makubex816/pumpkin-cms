# Pumpkin Platform Canonical Doc Index

This is the canonical index for current V2 platform navigation. Historical docs remain valuable, but current work should start here.

## Top-Level Control Docs

| Doc | Purpose |
| --- | --- |
| `PUMPKIN_PLATFORM_SOURCE_OF_TRUTH.md` | Current V2 canonical platform state |
| `PUMPKIN_PLATFORM_TRACKER.md` | V2 tracker and frozen legacy tracker |
| `PUMPKIN_PLATFORM_CANONICAL_DOC_INDEX.md` | Canonical V2 doc/result-package index |
| `PUMPKIN_PLATFORM_ACTIVE_BLOCKERS_AND_GATES.md` | V2 blockers and hard-stop gates |
| `PUMPKIN_PLATFORM_V2_REFERENCE_REBASELINE_REPORT.md` | V2.0 root report |
| `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_1_INVENTORY_IAC_PACKAGE_REPORT.md` | V2.3.1 Azure staging foundation root report |
| `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_2_RESOURCE_CREATION_BINDING_VALIDATION_REPORT.md` | V2.3.2 Azure staging creation gate root report |
| `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_3_TARGET_FINALIZATION_RESOURCE_CREATION_RETRY_REPORT.md` | V2.3.3 Azure staging resource creation root report |
| `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_4_RBAC_PROVIDER_PROFILE_OLM_CONTRACT_REPORT.md` | V2.3.4 Azure staging RBAC/profile/OLM contract root report |
| `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_1_FIRST_SCOPED_STAGING_WRITE_READBACK_REPORT.md` | V2.2.1 OLM first scoped staging write gate root report |
| `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_2_AZURE_IDENTITY_RBAC_COSMOS_EXECUTOR_READBACK_REPORT.md` | V2.2.2 OLM Azure Identity/RBAC Cosmos executor/readback root report |
| `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_3_STAGING_HARDENING_STAGE_READY_REPORT.md` | V2.2.3 OLM staging hardening/stage-ready root report |
| `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_4_ADMIN_API_STAGING_READONLY_BACKUP_STORAGE_REPORT.md` | V2.2.4 OLM Admin/API staging read-only and Backup Center storage proof root report |

## Latest Canonical Result Packages

| Area | Latest package | V2 refs | Status |
| --- | --- | --- | --- |
| V2 master reference | `deployment/architecture/platform-source-of-truth/v2-0-master-reference-rebaseline-layer-alignment-result/` | V2.0 / L01 | Current |
| Azure staging foundation | `deployment/architecture/azure-staging-foundation/v2-3-1-azure-staging-foundation-inventory-iac-package-result/` | V2.3.1 / L07 / L09 / L11 / L12 | Current no-deploy package |
| Azure staging creation gate | `deployment/architecture/azure-staging-foundation/v2-3-2-reviewed-resource-creation-binding-validation-result/` | V2.3.2 / L07 / L09 / L11 / L12 | Current blocked-before-mutation package |
| Azure staging resource creation | `deployment/architecture/azure-staging-foundation/v2-3-3-target-finalization-resource-creation-retry-result/` | V2.3.3 / L07 / L09 / L11 / L12 | Current created-resource package |
| Azure staging RBAC/profile/OLM contract | `deployment/architecture/azure-staging-foundation/v2-3-4-rbac-provider-profile-olm-contract-finalization-result/` | V2.3.4 / L07 / L08 / L09 / L11 / L12 | Current RBAC and contract package |
| OLM first scoped staging write gate | `deployment/architecture/outbound-link-manager/v2-2-1-first-scoped-staging-write-readback-result/` | V2.2.1 / L08 / L12 | Historical blocked-before-write package |
| OLM Azure Identity/RBAC Cosmos executor/readback | `deployment/architecture/outbound-link-manager/v2-2-2-azure-identity-rbac-cosmos-executor-readback-result/` | V2.2.2 / L06 / L08 / L09 / L11 / L12 | Historical scoped write/readback package |
| OLM staging hardening/stage-ready evidence | `deployment/architecture/outbound-link-manager/v2-2-3-staging-hardening-stage-ready-result/` | V2.2.3 / L06 / L08 / L09 / L10 / L12 | Historical partial stage-ready package |
| OLM Admin/API staging read-only and Backup Center storage proof | `deployment/architecture/outbound-link-manager/v2-2-4-admin-api-staging-readonly-backup-storage-result/` | V2.2.4 / L06 / L08 / L09 / L10 / L11 / L12 | Current ready-for-final-signoff package |
| OLM staging target/resource SOT binding | `deployment/architecture/outbound-link-manager/phase-2h24-olm-staging-target-resource-foundation-sot-binding-result/` | V2.2 / V2.5 | Current support proof |
| Platform source of truth legacy package | `deployment/architecture/platform-source-of-truth/phase-sot01-pumpkin-platform-source-of-truth-control-layer-result/` | V2.1 alias | Historical support proof |
| Backup Generator QA | `deployment/architecture/pumpkin-backup-export-restore/phase-2f14-backup-generator-qa-signoff-result/` | V2.4 | Current Backup Center support proof |
| Resource Registry live inventory | `deployment/architecture/pumpkin-backup-export-restore/phase-2f12n-real-resource-registry-live-inventory-result/` | V2.5 | Current redacted registry support proof |
| Runtime QA staging gate | `deployment/architecture/outbound-link-manager/phase-2h21-runtime-qa-provider-readiness-staging-gate-result/` | V2.6 | Current runtime QA support proof |

## Latest Canonical Root Reports

| Area | Report | V2 refs |
| --- | --- | --- |
| V2 master reference | `PUMPKIN_PLATFORM_V2_REFERENCE_REBASELINE_REPORT.md` | V2.0 |
| Azure staging foundation | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_1_INVENTORY_IAC_PACKAGE_REPORT.md` | V2.3.1 |
| Azure staging creation gate | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_2_RESOURCE_CREATION_BINDING_VALIDATION_REPORT.md` | V2.3.2 |
| Azure staging resource creation | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_3_TARGET_FINALIZATION_RESOURCE_CREATION_RETRY_REPORT.md` | V2.3.3 |
| Azure staging RBAC/profile/OLM contract | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_4_RBAC_PROVIDER_PROFILE_OLM_CONTRACT_REPORT.md` | V2.3.4 |
| OLM first scoped staging write gate | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_1_FIRST_SCOPED_STAGING_WRITE_READBACK_REPORT.md` | V2.2.1 |
| OLM Azure Identity/RBAC Cosmos executor/readback | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_2_AZURE_IDENTITY_RBAC_COSMOS_EXECUTOR_READBACK_REPORT.md` | V2.2.2 |
| OLM staging hardening/stage-ready evidence | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_3_STAGING_HARDENING_STAGE_READY_REPORT.md` | V2.2.3 |
| OLM Admin/API staging read-only and Backup Center storage proof | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_4_ADMIN_API_STAGING_READONLY_BACKUP_STORAGE_REPORT.md` | V2.2.4 |
| OLM staging target/resource SOT binding | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | V2.2 / V2.5 alias |
| Backup Generator QA | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | V2.4 |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | V2.5 |
| Runtime QA | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H21_RUNTIME_QA_PROVIDER_READINESS_STAGING_GATE_REPORT.md` | V2.6 |

## Historical But Useful Families

| Family | Use |
| --- | --- |
| `deployment/architecture/outbound-link-manager/phase-2h*/` | Legacy OLM phase history and implementation evidence |
| `deployment/architecture/pumpkin-backup-export-restore/phase-2f*/` | Backup Center, Resource Registry, Cosmos/media proof history |
| `deployment/architecture/multi-tenant-onboarding-system/` | Multi-tenant onboarding architecture and guardrails |
| `deployment/static-azure/` | Static export, staging, and deployment planning history |
| `deployment/azure/` | Azure staging/media/form endpoint preflight and result history |

## Docs To Treat Carefully

| Candidate | Reason |
| --- | --- |
| Root `README.md` configuration section | Older key-based placeholder examples are not the current safe operational source. |
| Legacy Phase 2H/SOT docs | Historical aliases only unless a V2 doc points to them. |
| Older Backup Center packages before 2F-14 | Historical proof chain; latest V2.4 support proof is 2F-14. |
| Static/Azure staging docs before current gates | Historical unless refreshed by an approved V2 phase. |
