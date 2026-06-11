# Pumpkin Platform Source Of Truth

This document is the canonical navigation layer for PumpkinCMS platform state using the V2.# reference system.

Use this first before choosing a next prompt, reading historical result packages, or attempting any provider action.

## Current State

| Field | Canonical state |
| --- | --- |
| Current V2 reference | V2.3.2, Reviewed Azure Staging Resource Creation and Binding Validation |
| Current V2 status | Complete, blocked before mutation |
| Provisional V2 overall completion | `61%` |
| Legacy tracker | Legacy 2H Tracker v1 frozen at `92 / 100` |
| Legacy alias | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| Active product lane | V2.2 Outbound Link Manager Stage-Ready with V2.3 Azure staging foundation support |
| Active layer refs | L01, L06, L07, L08, L09, L10, L11, L12 |
| Safety posture | No Azure resources created, no RBAC assigned, no protected-config-read, no deployment |
| Next gate | V2.3.3 final parameter worksheet and scoped creation retry |

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
| OLM foundation alias | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | Legacy alias proof for V2.2/V2.5 |
| Backup Center | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | V2.4 support proof |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | V2.5 support proof |
| Runtime QA | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H21_RUNTIME_QA_PROVIDER_READINESS_STAGING_GATE_REPORT.md` | V2.6 support proof |

## Active Blockers

The current hard stop is the missing OLM staging target/profile/session/readback/rollback contract:

- `OLM_STAGING_PROVIDER_PROFILE_ID`
- `OLM_STAGING_PROVIDER_TYPE`
- `OLM_STAGING_PROVIDER_MODE`
- `OLM_STAGING_RESOURCE_SCOPE`
- `OLM_STAGING_ACCOUNT_OR_HOST`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`
- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

Immutable current facts:

- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected package records: `48`
- records written: `0`
- real write readback run: `false`

## Next Recommended Phase

Approve V2.3.3 Azure Staging Foundation final parameter worksheet and scoped creation retry only. This should finalize the exact non-secret staging creation worksheet, remove placeholder/example values, confirm the stable reviewed subscription/tenant target, reconcile names, define RBAC or explicitly defer it, and only then retry scoped staging resource creation gates.
