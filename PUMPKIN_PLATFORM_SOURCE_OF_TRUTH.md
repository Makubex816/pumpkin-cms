# Pumpkin Platform Source Of Truth

This document is the canonical navigation layer for PumpkinCMS platform state using the V2.# reference system.

Use this first before choosing a next prompt, reading historical result packages, or attempting any provider action.

## Current State

| Field | Canonical state |
| --- | --- |
| Current V2 reference | V2.2.4, Admin/API Staging Read-only Bridge, Backup Center Storage Proof, and API QA Refresh |
| Current V2 status | Complete; V2.2 blockers resolved and ready for final stage-ready signoff |
| Provisional V2 overall completion | `74%` |
| Legacy tracker | Legacy 2H Tracker v1 frozen at `92 / 100` |
| Legacy alias | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| Active product lane | V2.2 Outbound Link Manager Stage-Ready with V2.3 Azure staging foundation support |
| Active layer refs | L01, L06, L07, L08, L09, L10, L11, L12 |
| Safety posture | Staging-backed read-only bridge complete; repeat readback passed; Backup Center storage proof uploaded with one container-scoped Storage Blob RBAC assignment; no additional OLM staging write, no destructive rollback, no production/CMS write, no protected-config read, no app deployment |
| Next gate | V2.2.5 OLM final stage-ready signoff and transition gate |

## V2 Reference System

| Reference | Name | Primary layers |
| --- | --- | --- |
| V2.0 | Master Reference Rebaseline and Layer Alignment | L01, L05, L08, L09, L10, L12 |
| V2.1 | Source-of-Truth / Governance Control | L01, L07, L12, L13 |
| V2.2 | Outbound Link Manager Stage-Ready | L03, L04, L05, L08, L09, L10, L12 |
| V2.3 | Azure Staging Resource Foundation | L07, L09, L11, L12 |
| V2.4 | Backup Center / Restore Gate | L06, L07, L12 |
| V2.5 | Resource Registry / Provider Profiles | L07, L09, L11 |
| V2.6 | Runtime QA Harness | L03, L04, L10, L12 |
| V2.7 | Admin/API Operator Console | L03, L04, L08, L13 |
| V2.8 | Tenant Website / Publish Readiness | L02, L15 |
| V2.9 | Audit, Jobs, Production Promotion Gates | L12, L13, L14, L15 |

## Latest Canonical Proofs

| Area | Latest canonical reference | State |
| --- | --- | --- |
| V2.0 rebaseline | `PUMPKIN_PLATFORM_V2_REFERENCE_REBASELINE_REPORT.md` | Current visible tracker model |
| V2.0 result package | `deployment/architecture/platform-source-of-truth/v2-0-master-reference-rebaseline-layer-alignment-result/` | Current reference package |
| Azure staging foundation | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_1_INVENTORY_IAC_PACKAGE_REPORT.md` | V2.3.1 no-deploy inventory and IaC package |
| Azure staging foundation package | `deployment/architecture/azure-staging-foundation/v2-3-1-azure-staging-foundation-inventory-iac-package-result/` | V2.3.1 result package |
| Azure staging creation gate | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_2_RESOURCE_CREATION_BINDING_VALIDATION_REPORT.md` | V2.3.2 blocked-before-mutation result |
| Azure staging creation gate package | `deployment/architecture/azure-staging-foundation/v2-3-2-reviewed-resource-creation-binding-validation-result/` | V2.3.2 result package |
| Azure staging resource creation | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_3_TARGET_FINALIZATION_RESOURCE_CREATION_RETRY_REPORT.md` | V2.3.3 staging resources created |
| Azure staging resource creation package | `deployment/architecture/azure-staging-foundation/v2-3-3-target-finalization-resource-creation-retry-result/` | V2.3.3 result package |
| Azure staging RBAC/profile/OLM contract | `PUMPKIN_AZURE_STAGING_FOUNDATION_V2_3_4_RBAC_PROVIDER_PROFILE_OLM_CONTRACT_REPORT.md` | V2.3.4 RBAC and OLM contract finalized |
| Azure staging RBAC/profile/OLM contract package | `deployment/architecture/azure-staging-foundation/v2-3-4-rbac-provider-profile-olm-contract-finalization-result/` | V2.3.4 result package |
| OLM first scoped staging write gate | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_1_FIRST_SCOPED_STAGING_WRITE_READBACK_REPORT.md` | V2.2.1 blocked before write |
| OLM first scoped staging write package | `deployment/architecture/outbound-link-manager/v2-2-1-first-scoped-staging-write-readback-result/` | V2.2.1 result package |
| OLM Azure Identity/RBAC Cosmos executor/readback | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_2_AZURE_IDENTITY_RBAC_COSMOS_EXECUTOR_READBACK_REPORT.md` | V2.2.2 scoped write/readback passed |
| OLM Azure Identity/RBAC Cosmos executor/readback package | `deployment/architecture/outbound-link-manager/v2-2-2-azure-identity-rbac-cosmos-executor-readback-result/` | V2.2.2 result package |
| OLM staging hardening/stage-ready evidence | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_3_STAGING_HARDENING_STAGE_READY_REPORT.md` | V2.2.3 repeat readback passed, partial stage-ready |
| OLM staging hardening/stage-ready package | `deployment/architecture/outbound-link-manager/v2-2-3-staging-hardening-stage-ready-result/` | V2.2.3 result package |
| OLM Admin/API staging read-only and Backup Center storage proof | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_4_ADMIN_API_STAGING_READONLY_BACKUP_STORAGE_REPORT.md` | V2.2.4 blockers resolved, ready for final signoff |
| OLM Admin/API staging read-only and Backup Center storage proof package | `deployment/architecture/outbound-link-manager/v2-2-4-admin-api-staging-readonly-backup-storage-result/` | V2.2.4 result package |
| OLM foundation alias | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | Legacy alias proof for V2.2/V2.5 |
| Backup Center | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | V2.4 support proof |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | V2.5 support proof |
| Runtime QA | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H21_RUNTIME_QA_PROVIDER_READINESS_STAGING_GATE_REPORT.md` | V2.6 support proof |

## Active Blockers

The missing repo-supported Azure Cosmos NoSQL data-plane write/readback adapter hard stop is resolved for the approved V2.2.2 scoped staging path only. V2.2.3 repeat readback/reconciliation passed, and V2.2.4 resolved the remaining Admin/API bridge, Backup Center storage proof, and API QA build-lock blockers. The platform can proceed to final V2.2 stage-ready signoff.

Immutable current facts:

- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected package records: `48`
- records written: `48`
- real write readback run: `true`
- provider profile candidate: `olm-staging-cosmos-nosql-v1`
- Cosmos data-plane RBAC assignments created at staging database scope: `2`
- OLM staging contract validation: `passed`
- V2.2.2 write gate: `passed_scoped_live_write_readback`
- V2.2.2 rollback deletion executed: `false`
- V2.2.2 Azure infrastructure mutations: `0`
- V2.2.2 RBAC assignments: `0`
- V2.2.3 additional OLM staging writes: `0`
- V2.2.3 repeat readback records: `48`
- V2.2.3 reconciliation: `passed`
- V2.2.3 stage-ready gate: `partial`
- V2.2.4 Admin/API staging-backed read-only bridge: `passed`
- V2.2.4 API QA refresh: `passed`
- V2.2.4 Backup Center storage proof: `uploaded`
- V2.2.4 Storage RBAC assignments: `1` container-scoped assignment
- V2.2.4 additional OLM staging writes: `0`
- V2.2.4 stage-ready gate: `ready_for_final_signoff`

## Next Recommended Phase

Approve V2.2.5 Outbound Link Manager final stage-ready signoff and transition gate only. The phase should perform a no-write final review over V2.2.2, V2.2.3, and V2.2.4 evidence, confirm stage-ready status, produce owner signoff materials, and keep all additional staging writes, production writes, CMS writes, deployment, indexing, and live publication blocked without a new explicit approval.
