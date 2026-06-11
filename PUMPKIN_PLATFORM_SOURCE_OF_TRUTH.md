# Pumpkin Platform Source Of Truth

This document is the canonical navigation layer for PumpkinCMS platform state using the V2.# reference system.

Use this first before choosing a next prompt, reading historical result packages, or attempting any provider action.

## Current State

| Field | Canonical state |
| --- | --- |
| Current V2 reference | V2.6.1, Runtime QA Harness Operationalization and Evidence Binding |
| Current V2 status | Complete; Runtime QA harness operationalized for local/read-only reusable evidence binding |
| Provisional V2 overall completion | `80%` |
| Legacy tracker | Legacy 2H Tracker v1 frozen at `92 / 100` |
| Legacy alias | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| Active product lane | V2.7 Admin/API Operator Console readiness after V2.6.1 runtime QA closure |
| Active layer refs | L01, L06, L07, L08, L09, L10, L11, L12 |
| Safety posture | V2.6.1 completed local/read-only Runtime QA harness validation; evidence upload blocked before upload by missing Storage data-plane RBAC; production-runtime blocked; live-write-approved scoped-only; no provider write, Azure mutation/RBAC change, production/CMS write, protected-config read, deployment, indexing, or publication |
| Next gate | V2.7.1 Admin/API Operator Console Runtime-QA-Bound Readiness |

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
| OLM Admin/API staging read-only and Backup Center storage proof | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_4_ADMIN_API_STAGING_READONLY_BACKUP_STORAGE_REPORT.md` | V2.2.4 blockers resolved, carried into V2.2.5 |
| OLM Admin/API staging read-only and Backup Center storage proof package | `deployment/architecture/outbound-link-manager/v2-2-4-admin-api-staging-readonly-backup-storage-result/` | V2.2.4 result package |
| OLM final stage-ready signoff | `PUMPKIN_OUTBOUND_LINK_MANAGER_V2_2_5_FINAL_STAGE_READY_SIGNOFF_REPORT.md` | V2.2.5 final signoff complete |
| OLM final stage-ready signoff package | `deployment/architecture/outbound-link-manager/v2-2-5-final-stage-ready-signoff-result/` | V2.2.5 final evidence-freeze package |
| Resource Registry / Provider Profile operationalization | `PUMPKIN_RESOURCE_REGISTRY_PROVIDER_PROFILE_V2_5_1_OPERATIONALIZATION_REPORT.md` | V2.5.1 local/read-only operational hardening complete |
| Resource Registry / Provider Profile operationalization package | `deployment/architecture/resource-registry-provider-profiles/v2-5-1-operationalization-hardening-result/` | V2.5.1 result package |
| Runtime QA operationalization | `PUMPKIN_RUNTIME_QA_V2_6_1_OPERATIONALIZATION_EVIDENCE_BINDING_REPORT.md` | V2.6.1 local/read-only platform harness complete; upload blocked by Storage data-plane RBAC |
| Runtime QA operationalization package | `deployment/architecture/runtime-qa/v2-6-1-operationalization-evidence-binding-result/` | V2.6.1 result package |
| OLM foundation alias | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | Legacy alias proof for V2.2/V2.5 |
| Backup Center | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | V2.4 support proof |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | V2.5 support proof |
| Runtime QA | `PUMPKIN_RUNTIME_QA_V2_6_1_OPERATIONALIZATION_EVIDENCE_BINDING_REPORT.md` | V2.6 current operational proof |

## Active Blockers

The missing repo-supported Azure Cosmos NoSQL data-plane write/readback adapter hard stop is resolved for the approved V2.2.2 scoped staging path only. V2.2 has no remaining stage-ready blockers. V2.5.1 operationalized the Resource Registry / Provider Profile control layer for local/read-only use. V2.6.1 operationalized the reusable Runtime QA harness and evidence manifest path. Runtime QA staging upload is blocked by missing Storage data-plane RBAC, but local evidence is complete.

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
- V2.2.5 final readback records: `48`
- V2.2.5 additional OLM staging writes: `0`
- V2.2.5 Backup Center storage proof list: `4` expected blobs
- V2.2.5 OLM package tests: `132` passed
- V2.2.5 final stage-ready gate: `complete_stage_ready`
- V2.5.1 operational binding validator: `passed`
- V2.5.1 operational binding warnings: `0`
- V2.5.1 provider profiles represented: `9`
- V2.5.1 resource bindings represented: `6`
- V2.5.1 Resource Registry implementation tests: `15` passed
- V2.5.1 production-runtime state: `blocked`
- V2.5.1 live-write-approved state: `scoped-only`
- V2.6.1 Runtime QA harness checks: `13` passed
- V2.6.1 Runtime QA package tests: `4` passed
- V2.6.1 Runtime QA evidence validation: `passed`
- V2.6.1 Runtime QA upload: `blocked_before_upload_missing_storage_data_plane_rbac`
- V2.6.1 Admin runtime QA: `passed`
- V2.6.1 API read-only QA: `passed`
- V2.6.1 API write guard QA: `passed`
- V2.6.1 production-runtime state: `blocked`
- V2.6.1 live-write-approved state: `scoped-only`

## Next Recommended Phase

Approve V2.7.1 Admin/API Operator Console Runtime-QA-Bound Readiness only. The phase should use the completed V2.6.1 Runtime QA harness, V2.5.1 Resource Registry / Provider Profile control layer, and V2.2 stage-ready evidence to bind operator-console readiness surfaces to local/read-only runtime QA evidence. Keep the phase local/read-only: no provider writes, no Azure mutation, no RBAC changes, no protected config reads, no keys/listKeys, no connection strings, no SAS, no CMS writes, no deployment, no indexing, and no live publication.
