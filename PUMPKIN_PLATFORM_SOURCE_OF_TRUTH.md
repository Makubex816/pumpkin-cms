# Pumpkin Platform Source Of Truth

This document is the canonical navigation layer for PumpkinCMS platform state using the V2.# reference system.

Use this first before choosing a next prompt, reading historical result packages, or attempting any provider action.

## Current State

| Field | Canonical state |
| --- | --- |
| Current V2 reference | V2.2.1, First Scoped OLM Staging Write and Readback Gate |
| Current V2 status | Blocked before write; Azure target/RBAC/contract gates passed, repo live Cosmos write/readback executor unavailable |
| Provisional V2 overall completion | `67%` |
| Legacy tracker | Legacy 2H Tracker v1 frozen at `92 / 100` |
| Legacy alias | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| Active product lane | V2.2 Outbound Link Manager Stage-Ready with V2.3 Azure staging foundation support |
| Active layer refs | L01, L06, L07, L08, L09, L10, L11, L12 |
| Safety posture | Staging Azure foundation created; staging DB-scoped Cosmos RBAC assigned; no OLM write, no protected-config-read, no app deployment |
| Next gate | V2.2.2 OLM Azure Cosmos staging data-plane executor/readback adapter and first-write retry |

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
| OLM foundation alias | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | Legacy alias proof for V2.2/V2.5 |
| Backup Center | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | V2.4 support proof |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | V2.5 support proof |
| Runtime QA | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H21_RUNTIME_QA_PROVIDER_READINESS_STAGING_GATE_REPORT.md` | V2.6 support proof |

## Active Blockers

The current hard stop is the missing repo-supported Azure Cosmos NoSQL data-plane write/readback adapter for `live-write-approved` OLM staging execution. V2.2.1 passed the target, RBAC inventory, provider profile, package linkage, and `OLM_STAGING_*` contract checks, then stopped before write because the current executor blocks `live-write-approved` with `LIVE_WRITE_APPROVED_UNAVAILABLE`.

Immutable current facts:

- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected package records: `48`
- records written: `0`
- real write readback run: `false`
- provider profile candidate: `olm-staging-cosmos-nosql-v1`
- Cosmos data-plane RBAC assignments created at staging database scope: `2`
- OLM staging contract validation: `passed`
- V2.2.1 write gate: `blocked_before_write_repo_live_writer_unavailable`

## Next Recommended Phase

Approve V2.2.2 Outbound Link Manager Azure Cosmos staging data-plane executor/readback adapter and first-write retry only. The phase must implement the minimal repo-supported Azure Identity/RBAC adapter, preserve local/offline and staging-simulated profiles, keep production-runtime blocked, then retry only `olbatch_b08e184fdc6565aa` if every gate passes.
