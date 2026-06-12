# Pumpkin Platform Source Of Truth

This document is the canonical navigation layer for PumpkinCMS platform state using the V2.# reference system.

Use this first before choosing a next prompt, reading historical result packages, or attempting any provider action.

## Current State

| Field | Canonical state |
| --- | --- |
| Current V2 reference | V2.8.4, Staging Publish Worksheet and No-Go Criteria |
| Current V2 status | Complete staging publish worksheet/no-go package; staging execution remains blocked by no-dotenv, owner verification, target, DNS, indexing, and publication gates |
| Provisional V2 overall completion | `89%` |
| Legacy tracker | Legacy 2H Tracker v1 frozen at `92 / 100` |
| Legacy alias | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| Active product lane | V2.8 Tenant Website / Publish Readiness |
| Active layer refs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| Safety posture | V2.8.4 performed planning/local-read-only validation only; no provider write, Azure mutation, RBAC assignment, CMS write, deployment, DNS change, indexing, publication, protected config read, or external crawl |
| Next gate | V2.8.5 Sanitized No-Dotenv Static Build Harness and Staging Execution Preflight |

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
| Admin/API Operator Console Runtime-QA-bound readiness | `PUMPKIN_ADMIN_API_OPERATOR_CONSOLE_V2_7_1_RUNTIME_QA_BOUND_READINESS_REPORT.md` | V2.7.1 local/read-only Admin/API readiness complete; upload blocker carried forward |
| Admin/API Operator Console Runtime-QA-bound readiness package | `deployment/architecture/admin-api-operator-console/v2-7-1-runtime-qa-bound-readiness-result/` | V2.7.1 result package |
| Admin/API Operator Console upload closure and signoff | `PUMPKIN_ADMIN_API_OPERATOR_CONSOLE_V2_7_2_RUNTIME_QA_UPLOAD_SIGNOFF_REPORT.md` | V2.7.2 Runtime QA upload closure complete; V2.7 signed off |
| Admin/API Operator Console upload closure and signoff package | `deployment/architecture/admin-api-operator-console/v2-7-2-runtime-qa-upload-operator-console-signoff-result/` | V2.7.2 result package |
| Tenant Website publish-readiness local preflight | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_1_LOCAL_PREFLIGHT_REPORT.md` | V2.8.1 local/read-only preflight complete; publish blocked by current Ice route/static/form/media gates |
| Tenant Website publish-readiness local preflight package | `deployment/architecture/tenant-website-publish-readiness/v2-8-1-local-preflight-result/` | V2.8.1 result package |
| Tenant Website Ice static source route repair | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_2_ICE_STATIC_SOURCE_ROUTE_REPAIR_REPORT.md` | V2.8.2 local route repair complete; static output/staging package validators pass |
| Tenant Website Ice static source route repair package | `deployment/architecture/tenant-website-publish-readiness/v2-8-2-ice-static-source-route-repair-result/` | V2.8.2 result package |
| Tenant Website Ice local publish-readiness signoff | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_3_ICE_LOCAL_SIGNOFF_REPORT.md` | V2.8.3 local signoff complete; deploy/DNS/index/live publication gates closed |
| Tenant Website Ice local publish-readiness signoff package | `deployment/architecture/tenant-website-publish-readiness/v2-8-3-ice-local-publish-readiness-signoff-result/` | V2.8.3 result package |
| Tenant Website staging publish worksheet/no-go criteria | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_4_STAGING_PUBLISH_WORKSHEET_NO_GO_REPORT.md` | V2.8.4 worksheet complete; staging execution blocked by no-go criteria |
| Tenant Website staging publish worksheet/no-go criteria package | `deployment/architecture/tenant-website-publish-readiness/v2-8-4-staging-publish-worksheet-no-go-result/` | V2.8.4 result package |
| OLM foundation alias | `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H24_STAGING_TARGET_RESOURCE_FOUNDATION_SOT_BINDING_REPORT.md` | Legacy alias proof for V2.2/V2.5 |
| Backup Center | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F14_BACKUP_GENERATOR_QA_SIGNOFF_REPORT.md` | V2.4 support proof |
| Resource Registry | `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_REPORT.md` | V2.5 support proof |
| Runtime QA | `PUMPKIN_RUNTIME_QA_V2_6_1_OPERATIONALIZATION_EVIDENCE_BINDING_REPORT.md` | V2.6 operational proof |
| Admin/API Operator Console | `PUMPKIN_ADMIN_API_OPERATOR_CONSOLE_V2_7_1_RUNTIME_QA_BOUND_READINESS_REPORT.md` | V2.7 current operational proof |
| Admin/API Operator Console Signoff | `PUMPKIN_ADMIN_API_OPERATOR_CONSOLE_V2_7_2_RUNTIME_QA_UPLOAD_SIGNOFF_REPORT.md` | V2.7 final signoff proof |

## Active Blockers

The missing repo-supported Azure Cosmos NoSQL data-plane write/readback adapter hard stop is resolved for the approved V2.2.2 scoped staging path only. V2.2 has no remaining stage-ready blockers. V2.5.1 operationalized the Resource Registry / Provider Profile control layer for local/read-only use. V2.6.1 operationalized the reusable Runtime QA harness and evidence manifest path. V2.7.1 bound Admin/API operator-console readiness to that evidence chain. V2.7.2 resolved Runtime QA staging upload through a narrow container-scoped Storage Blob data-plane RBAC assignment and verified uploaded evidence. V2.7 is complete. V2.8.1 completed a local/read-only tenant website publish-readiness preflight and found the current safe Ice seed-site publish path blocked before deployment. V2.8.2 repaired the local Ice route source and validated the ignored static artifact package without deploying. V2.8.3 signed off Ice local publish-readiness and kept deployment/DNS/indexing/live publication closed. V2.8.4 created the staging publish worksheet and no-go criteria without executing staging.

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
- V2.7.1 Admin operator console readiness: `passed`
- V2.7.1 API operator readiness endpoint: `passed`
- V2.7.1 Runtime QA harness checks: `15` passed
- V2.7.1 Runtime QA evidence validation: `passed`
- V2.7.1 Resource Registry operational binding validator: `passed`
- V2.7.1 provider profile validation: `passed`
- V2.7.1 OLM_STAGING env contract validation: `passed`
- V2.7.1 no-uncontrolled-write scan: `passed`
- V2.7.1 Runtime QA upload: `blocked_before_upload_missing_storage_data_plane_rbac`
- V2.7.1 additional OLM staging writes: `0`
- V2.7.1 Azure infrastructure mutations: `0`
- V2.7.1 RBAC assignments: `0`
- V2.7.2 Runtime QA upload blocker: `resolved`
- V2.7.2 Storage Blob RBAC assignment: `1` container-scoped assignment for `runtime-qa-staging`
- V2.7.2 broad/subscription RBAC assignments: `0`
- V2.7.2 Runtime QA evidence uploaded files: `4`
- V2.7.2 Runtime QA uploaded files listed: `4`
- V2.7.2 Runtime QA harness checks: `15` passed
- V2.7.2 Runtime QA evidence validation: `passed`
- V2.7.2 Admin operator console signoff: `passed`
- V2.7.2 API readiness signoff: `passed`
- V2.7.2 API write guard QA: `passed`
- V2.7.2 no-uncontrolled-write scan: `passed`
- V2.7.2 additional OLM staging writes: `0`
- V2.7.2 provider data writes: `0`
- V2.7.2 Azure infrastructure creations: `0`
- V2.7.2 production/CMS/deployment/indexing/publication actions: `0`
- V2.8.1 active proof tenant: `ice-rink-rentals`
- V2.8.1 paused tenant: `roller-rink-rentals`
- V2.8.1 Ice static source validation: `failed_expected_publish_blocker`
- V2.8.1 Ice missing route: `/service-areas`
- V2.8.1 Ice obsolete routes present: `/ice-rink-rentals`, `/events-holiday-activations`
- V2.8.1 tenant website type-check: `passed`
- V2.8.1 Ice static build: `passed_with_warnings_protected_config_caveat`
- V2.8.1 Ice static output validation: `failed_expected_publish_blocker`
- V2.8.1 Runtime QA evidence run: `runtimeqa_85a8b84955410b83`
- V2.8.1 Resource Registry operational binding validator: `passed`
- V2.8.1 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.1 OLM_STAGING current-session env contract: `blocked_missing_10_fields`
- V2.8.1 deployment/DNS/indexing/live publication actions: `0`
- V2.8.2 Ice canonical routes: `/`, `/contact`, `/service-areas`
- V2.8.2 Ice obsolete seed routes removed: `/ice-rink-rentals`, `/events-holiday-activations`
- V2.8.2 Ice local seed validation: `passed_3_page_documents`
- V2.8.2 Ice static source validation: `passed_with_34_warnings`
- V2.8.2 Ice static build: `passed_with_warnings_protected_config_caveat`
- V2.8.2 Ice static output validation: `passed_zero_errors_zero_warnings`
- V2.8.2 Ice staging package validation: `passed_zero_errors_zero_warnings`
- V2.8.2 Runtime QA evidence run: `runtimeqa_3bb02639b61fe9d9`
- V2.8.2 Resource Registry operational binding validator: `passed`
- V2.8.2 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.2 provider data writes: `0`
- V2.8.2 CMS writes: `0`
- V2.8.2 Azure infrastructure mutations: `0`
- V2.8.2 RBAC assignments: `0`
- V2.8.2 deployment/DNS/indexing/live publication actions: `0`
- V2.8.3 Ice local publish-readiness signoff: `complete_local_publish_ready_deploy_closed`
- V2.8.3 Ice canonical routes: `/`, `/service-areas`, `/contact`
- V2.8.3 Ice fallback/source route reconciliation: `passed`
- V2.8.3 Ice local seed validation: `passed_3_page_documents`
- V2.8.3 Ice static source validation: `passed_with_34_warnings`
- V2.8.3 Roller static source validation: `passed_with_31_warnings_paused_tenant_safety_check`
- V2.8.3 tenant website type-check: `passed`
- V2.8.3 Ice static build: `passed_with_warnings_protected_config_caveat`
- V2.8.3 Ice static output validation: `passed_zero_errors_zero_warnings`
- V2.8.3 Ice staging package validation: `passed_zero_errors_zero_warnings`
- V2.8.3 Runtime QA evidence run: `runtimeqa_f1d3f440a58144b4`
- V2.8.3 Resource Registry operational binding validator: `passed`
- V2.8.3 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.3 provider data writes: `0`
- V2.8.3 CMS writes: `0`
- V2.8.3 Azure infrastructure mutations: `0`
- V2.8.3 RBAC assignments: `0`
- V2.8.3 deployment/DNS/indexing/live publication actions: `0`
- V2.8.4 staging publish worksheet: `complete_execution_blocked`
- V2.8.4 sanitized no-dotenv build path: `blocked_no_repo_supported_no_dotenv_next_build_path`
- V2.8.4 contact-form owner verification: `blocked_owner_verification_required`
- V2.8.4 media/content final approval: `blocked_owner_approval_required`
- V2.8.4 Runtime QA evidence run: `runtimeqa_e42c0a2c9da73a4a`
- V2.8.4 Resource Registry operational binding validator: `passed`
- V2.8.4 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.4 provider data writes: `0`
- V2.8.4 CMS writes: `0`
- V2.8.4 Azure infrastructure mutations: `0`
- V2.8.4 RBAC assignments: `0`
- V2.8.4 deployment/DNS/indexing/live publication actions: `0`

## Next Recommended Phase

Approve V2.8.5 Sanitized No-Dotenv Static Build Harness and Staging Execution Preflight only. Use the completed V2.8.4 staging publish worksheet/no-go package to implement or document a repo-supported sanitized no-dotenv static build harness for Ice, prove that the Ice static build can run without loading `.env.local` or protected config, generate ignored local `.tmp` evidence, rerun static output and staging package validators against sanitized output, refresh Runtime QA/Resource Registry/OLM provider checks, update the staging publish worksheet with pass/fail evidence, and produce the next scoped staging execution approval prompt. No deployment, DNS changes, Search Console/indexing, live-page publication, CMS writes, provider data writes, Azure infrastructure mutation, RBAC assignment, protected config reads, keys/listKeys, connection strings, SAS, external crawling/live URL checks, or generated artifacts staged into Git.
