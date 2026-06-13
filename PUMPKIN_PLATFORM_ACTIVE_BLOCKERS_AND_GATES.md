# Pumpkin Platform Active Blockers And Gates

## Current V2 Gate Summary

| Gate | Status | V2 refs | Required unblock |
| --- | --- | --- | --- |
| Azure staging foundation inventory and IaC package | Complete | V2.3.1 / L07 / L09 / L11 / L12 | No-deploy package created; no Azure mutation performed. |
| Azure staging creation and binding validation | Complete, blocked before mutation | V2.3.2 / L07 / L09 / L11 / L12 | V2.3.1 values were candidate/example-level; no resources created. |
| Azure staging final parameter worksheet and creation retry | Complete | V2.3.3 / L07 / L09 / L11 / L12 | Staging resource group and resource foundation created; RBAC skipped. |
| Azure staging RBAC/profile/OLM contract finalization | Complete | V2.3.4 / L07 / L08 / L09 / L11 / L12 | Staging DB-scoped Cosmos RBAC assigned; provider profile and Resource Registry candidates created; OLM contract passed. |
| First scoped OLM staging write gate | Complete | V2.2.2 / L08 / L12 | Approved batch `olbatch_b08e184fdc6565aa` wrote 48 records and passed readback. |
| OLM staging hardening/readback gate | Complete, carried forward into V2.2.4 | V2.2.3 / L06 / L08 / L09 / L10 / L12 | Repeat readback/reconciliation passed; remaining blockers were resolved in V2.2.4. |
| OLM Admin/API staging read-only and Backup Center storage proof | Complete, carried into V2.2.5 final signoff | V2.2.4 / L06 / L08 / L09 / L10 / L11 / L12 | Bridge, API QA refresh, repeat readback sanity, and Backup Center storage proof passed. |
| OLM final stage-ready signoff and evidence freeze | Complete | V2.2.5 / L01 / L06 / L08 / L09 / L10 / L11 / L12 | Final readback sanity, Admin/API QA, Backup Center proof list, and evidence freeze passed. |
| Resource Registry / Provider Profile operationalization | Complete | V2.5.1 / L01 / L06 / L07 / L08 / L09 / L10 / L11 / L12 | Operational binding fixture, validator, schemas, matrices, and read-only staging checks passed. |
| Runtime QA harness operationalization and evidence binding | Complete, upload blocked before upload | V2.6.1 / L01 / L06 / L07 / L08 / L09 / L10 / L11 / L12 | Reusable local/offline harness, registry, evidence manifest, Admin/API checks, and no-uncontrolled-write scan passed; upload requires future Storage data-plane RBAC. |
| Admin/API Operator Console Runtime-QA-bound readiness | Complete, upload blocker carried forward | V2.7.1 / L01 / L06 / L07 / L08 / L09 / L10 / L11 / L12 | Admin/API readiness metadata, GET-only operator readiness endpoint, Runtime QA fixture, no-uncontrolled-write scan, and control docs passed; upload requires future Storage data-plane RBAC. |
| Runtime QA upload closure and Admin/API Operator Console signoff | Complete | V2.7.2 / L01 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 | Runtime QA upload blocker resolved with one staging container-scoped Storage Blob data-plane RBAC assignment; evidence uploaded/listed; V2.7 signed off. |
| Tenant Website and Publish Readiness local preflight | Complete, publish blocked | V2.8.1 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Local/read-only preflight complete; current safe Ice seed-site source is missing `/service-areas`, contains obsolete Ice routes, and static output/form/media/deploy gates remain closed. |
| Ice Static Source Route Repair and Local Publish Gate Revalidation | Complete, deployment still closed | V2.8.2 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Local Ice seed route source repaired to `/`, `/contact`, `/service-areas`; static output and staging package validators passed; deployment/DNS/index/live publication remain closed. |
| Ice Local Publish-Readiness Final Signoff and Gate Freeze | Complete local signoff, deployment still closed | V2.8.3 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Ice local source/fallback/output route model signed off as `/`, `/service-areas`, `/contact`; Runtime QA, Resource Registry, OLM, Backup Center, and Admin/API gate inputs current; deployment/DNS/index/live publication remain closed. |
| Staging Publish Worksheet and No-Go Criteria | Complete worksheet, execution blocked | V2.8.4 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Staging worksheet and no-go matrix complete; staging execution blocked by sanitized no-dotenv build proof, owner contact-form verification, media/content approval, target/DNS approval, indexing, and live-publication gates. |
| Sanitized No-Dotenv Static Build and Approval Packet Closure | Complete local build path, execution blocked | V2.8.5 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Repo-supported sanitized no-dotenv Ice static build path passed under ignored `.tmp`; staging execution remains blocked by contact-form owner verification, media/content approval, exact target/DNS approval, indexing, and live-publication gates. |
| Contact Form Media Staging Target Approval Intake and Validator Gate Classification | Complete local classification, execution blocked | V2.8.6 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Static validators now distinguish local static integrity from external backend/owner gates; local static integrity passed, while form endpoint/backend, owner/media/content, exact target, DNS, indexing, and publication gates remain blocked/closed. |
| External Approval Intake Closure and Staging Target Finalization Packet | Complete local records, execution blocked | V2.8.7 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | No-email endpoint candidate recorded from safe repo evidence; backend verification remains blocked, owner/media/content and exact staging target approvals remain unresolved, and DNS/indexing/live-publication gates remain closed. |
| Owner Approval Values and Static Form Endpoint Verification Closure | Complete classifier hardening, execution blocked | V2.8.8 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Static form validators now distinguish endpoint configured, endpoint owner-approved, backend-verified, blocked, and no-live-check states; fresh sanitized build passed, but no approved endpoint/owner/backend/media/target values were present. |
| Full-Scope External Approval Values Closure and Staging Readiness Validation | Complete local validation, execution blocked | V2.8.9 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Safe candidate endpoint configured for local validation and local static integrity passed; staging execution remains blocked by missing owner/backend/media/content/exact-target approvals. |
| Owner Backend Media and Exact Staging Target Approval Intake | Complete local/control-layer gate closure, execution blocked | V2.8.10 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Endpoint owner, contact-form owner, and media/content approvals closed for staging-readiness only; backend verification and exact executable SWA target still block staging execution. |
| Backend Verification and Exact Staging Target Resolution Boundary | Complete safe metadata resolution, execution blocked | V2.8.11 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Function App and actual SWA target are resolved from safe read-only metadata; backend POST/form behavior verification, staging deploy operator, rollback/abort owner, and deployment secret boundary still block staging execution. |
| Backend Live Verification Scope and Staging Operator Rollback Closure | Complete boundary packet, execution blocked | V2.8.12 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Backend live verification packet and deployment method are prepared; named deploy operator, named rollback/abort owner, external secret-storage confirmation, and backend POST evidence still block staging execution. |
| Backend Live POST and Operator Rollback Naming | Complete backend verified, staging publish approval ready | V2.8.13 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | One approved synthetic backend POST returned `200 OK`; operator and rollback labels are closed as `PumpkinCMS operator`; future scoped staging deployment still requires separate V2.8.14 approval and DNS/indexing/live-publication gates remain closed. |
| Scoped Ice Staging Publish Execution | Complete, blocked before deployment | V2.8.14 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Fresh sanitized artifact and validators passed, but deployment stopped because the target has production custom domains attached, deployment-token env vars are absent, and `swa` CLI is unavailable. |
| Staging Target Isolation and Deployment Auth Closure | Complete, blocked by deployment auth only | V2.8.14A / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | One isolated non-production SWA target `swa-ice-static-isolated-staging` was created and verified with no custom domains; pinned npx SWA CLI tooling and readiness wrapper exist; deployment waits on `SWA_CLI_DEPLOYMENT_TOKEN`. |
| Scoped Ice Isolated Staging Deployment Execution | Complete, blocked before deployment by auth | V2.8.14B / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Isolated target, tooling, and fresh artifact gates passed, but deployment stopped before execution because `SWA_CLI_DEPLOYMENT_TOKEN` is absent. |
| Deployment Auth Retry and Scoped Ice Isolated Staging Deployment | Complete, deployed and verified | V2.8.14C / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Isolated target, tooling, and fresh artifact gates passed; exactly one deployment to `swa-ice-static-isolated-staging` succeeded; `/`, `/service-areas`, and `/contact` returned `200 OK`. |
| Post-Staging Verification and Owner Signoff | Complete, isolated staging ready | V2.8.15 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Final isolated staging target confirmation, route checks, validation stack, and owner/operator staging signoff passed. Production release remains not approved. |
| Production Release Boundary Planning and Approval Packet | Complete, production planned but not approved | V2.8.16 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Strategy comparison, target worksheet, DNS/custom-domain worksheet, indexing worksheet, live-publication worksheet, approval checklist, rollback plan, and no-go matrix complete. Production execution remains closed. |
| Production Release Execution Approval | Complete, production deployment failed | V2.8.17 / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | All pre-production gates passed and exactly one deployment attempt was sent to `swa-ice-static-staging`; SWA CLI deployment failed with exit code `1`, no retry was attempted, and production route checks were not run. |
| Production Deployment Failure Forensics Corrective Retry Boundary | Complete, blocked before corrective retry | V2.8.17A / L01 / L02 / L03 / L04 / L06 / L07 / L08 / L09 / L10 / L11 / L12 / L15 | Failure forensics and artifact revalidation passed, but corrected dry-run rejected the current deployment token as invalid; no corrective deployment retry was sent and route checks were not run. |
| OLM real staging provider target | Seeded and readback-hardened for approved scoped batch | V2.2 / V2.3 / V2.5 | Keep `olm-staging-cosmos-nosql-v1` closed to additional writes until a new explicit approval. |
| OLM readback/rollback | Repeat readback passed; rollback plan preserved | V2.2 / V2.4 / V2.9 | Non-destructive rollback validation passed; rollback deletion was not executed. |
| Azure resource creation/mutation | Closed | V2.3 / L11 | Separate explicit approval required. |
| RBAC assignment | Complete for V2.3.4 staging database scope and V2.2.4 Backup Center staging container scope | V2.3 / L11 / L12 | Future RBAC changes require separate explicit approval. |
| Production database migration | Closed | V2.9 / L12 | Future explicit production migration approval only. |
| Production provider writes | Closed | V2.9 / L12 | Future explicit production write approval only. |
| CMS writes | Closed | L04 / L12 | Separate scoped approval required. |
| Deployment/indexing/publication | Isolated staging deployment complete; production deployment attempt failed; corrective retry blocked before deployment; indexing/publication gates closed | V2.8 / V2.9 / L15 | Production auth replacement, corrective retry, DNS, custom domains, indexing, and live publication require separate explicit approval. |

## Remaining OLM Stage-Ready Gates

No V2.2 stage-ready blockers remain.

Still separately gated:

- Keep `production-runtime` blocked and keep any additional `live-write-approved` operation scoped to a future explicit approval.
- Validate destructive rollback deletion only under a future separate approval.
- Do not perform production migration, production writes, CMS writes, deployment, indexing, or live publication without explicit approval.

## Resolved Or Supplyable OLM Staging Resource Values

- `OLM_STAGING_PROVIDER_TYPE`: `azure-cosmos-nosql`
- `OLM_STAGING_PROVIDER_PROFILE_ID`: `olm-staging-cosmos-nosql-v1`
- `OLM_STAGING_PROVIDER_MODE`: `live-write-approved`
- `OLM_STAGING_RESOURCE_SCOPE`: `resourceGroup:rg-pumpkincms-stg-eastus-olm`
- `OLM_STAGING_ACCOUNT_OR_HOST`: `cosmos-pumpkincms-stg-olm01.documents.azure.com`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`: `pumpkincms-olm-staging`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`: `cosmos-nosql-data-plane-rbac`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`: `operator-azure-cli-session+managed-identity`
- `OLM_STAGING_READBACK_METHOD`: `cosmos-nosql-tenant-site-batch-id-readback`
- `OLM_STAGING_ROLLBACK_METHOD`: `cosmos-nosql-first-write-batch-delete-by-batch-id`

## Immutable Safety Facts

- Legacy 2H Tracker v1 frozen value: `92 / 100`
- OLM approval manifest: `olapprove_508df3f03faa4f80`
- OLM first-write batch: `olbatch_b08e184fdc6565aa`
- Expected OLM staging package records: `48`
- OLM records written: `48`
- Real OLM write readback run: `true`
- OLM readback result: `passed`
- OLM trace/audit/rollback validation: `passed`
- OLM rollback deletion executed: `false`
- V2.0 Azure resources created: `0`
- V2.0 Azure resources mutated: `0`
- V2.0 RBAC assignments: `0`
- V2.3.1 Azure resources created: `0`
- V2.3.1 Azure resources mutated: `0`
- V2.3.1 RBAC assignments: `0`
- V2.3.1 staging writes: `0`
- V2.3.2 Azure resources created: `0`
- V2.3.2 Azure resources mutated: `0`
- V2.3.2 RBAC assignments: `0`
- V2.3.2 staging writes: `0`
- V2.3.3 Azure staging resource group created/updated: `1`
- V2.3.3 Azure staging foundation deployment: `Succeeded`
- V2.3.3 RBAC assignments: `0`
- V2.3.3 OLM staging writes: `0`
- V2.3.4 Cosmos data-plane RBAC assignments: `2`
- V2.3.4 Storage RBAC assignments: `0`
- V2.3.4 Key Vault RBAC assignments: `0`
- V2.3.4 OLM staging contract validation: `passed`
- V2.3.4 OLM staging writes: `0`
- V2.2.1 pre-write target/RBAC/package checks: `passed`
- V2.2.1 live-write-approved executor gate: `blocked`
- V2.2.1 OLM staging writes: `0`
- V2.2.1 readback run: `false`
- V2.2.2 Azure Identity/RBAC adapter implementation: `complete`
- V2.2.2 scoped OLM staging writes: `48`
- V2.2.2 readback run: `true`
- V2.2.2 readback result: `passed`
- V2.2.2 Azure infrastructure mutations: `0`
- V2.2.2 RBAC assignments: `0`
- V2.2.2 production writes: `0`
- V2.2.3 additional OLM staging writes: `0`
- V2.2.3 repeat readback run: `true`
- V2.2.3 repeat readback records: `48`
- V2.2.3 entity reconciliation: `passed`
- V2.2.3 Backup Center staging proof: `local_result_package_based`
- V2.2.3 stage-ready gate: `partial`
- V2.2.4 Admin/API staging-backed read-only bridge: `passed`
- V2.2.4 API read-only QA: `passed`
- V2.2.4 API write-action QA refresh: `passed`
- V2.2.4 repeat readback records: `48`
- V2.2.4 additional OLM staging writes: `0`
- V2.2.4 Backup Center staging proof: `uploaded`
- V2.2.4 Storage RBAC assignments: `1` container-scoped Storage Blob Data Contributor
- V2.2.4 stage-ready gate: `ready_for_final_signoff`
- V2.2.5 final readback sanity: `passed`
- V2.2.5 final readback records: `48`
- V2.2.5 additional OLM staging writes: `0`
- V2.2.5 Backup Center proof blobs listed: `4`
- V2.2.5 OLM package tests: `132` passed
- V2.2.5 final stage-ready gate: `complete_stage_ready`
- V2.5.1 operational binding validator: `passed`
- V2.5.1 operational binding failures: `0`
- V2.5.1 operational binding warnings: `0`
- V2.5.1 environment modes represented: `9`
- V2.5.1 provider profiles represented: `9`
- V2.5.1 resource bindings represented: `6`
- V2.5.1 Resource Registry implementation tests: `15` passed
- V2.5.1 production-runtime state: `blocked`
- V2.5.1 live-write-approved state: `scoped-only`
- V2.6.1 Runtime QA harness checks: `13` passed
- V2.6.1 Runtime QA package tests: `4` passed
- V2.6.1 Runtime QA evidence validation: `passed`
- V2.6.1 Resource Registry operational binding validator: `passed`
- V2.6.1 provider profile validation: `passed`
- V2.6.1 OLM_STAGING env contract validation: `passed`
- V2.6.1 Admin runtime QA: `passed`
- V2.6.1 API read-only QA: `passed`
- V2.6.1 API write guard QA: `passed`
- V2.6.1 runtime-qa-staging container metadata check: `passed`
- V2.6.1 runtime-qa-staging blob list: `blocked_missing_storage_data_plane_rbac`
- V2.6.1 runtime QA evidence upload: `blocked_before_upload`
- V2.6.1 additional OLM staging writes: `0`
- V2.6.1 Azure infrastructure mutations: `0`
- V2.6.1 RBAC assignments: `0`
- V2.7.1 Admin operator console readiness: `passed`
- V2.7.1 API operator readiness endpoint: `passed`
- V2.7.1 Runtime QA harness checks: `15` passed
- V2.7.1 Runtime QA evidence validation: `passed`
- V2.7.1 Resource Registry operational binding validator: `passed`
- V2.7.1 provider profile validation: `passed`
- V2.7.1 OLM_STAGING env contract validation: `passed`
- V2.7.1 no-uncontrolled-write scan: `passed`
- V2.7.1 runtime QA evidence upload: `blocked_before_upload_missing_storage_data_plane_rbac`
- V2.7.1 additional OLM staging writes: `0`
- V2.7.1 Azure infrastructure mutations: `0`
- V2.7.1 RBAC assignments: `0`
- V2.7.2 Runtime QA upload blocker: `resolved`
- V2.7.2 Storage Blob RBAC assignments: `1` container-scoped assignment for `runtime-qa-staging`
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
- V2.8.1 Roller static source validation: `passed_with_31_warnings`
- V2.8.1 tenant website type-check: `passed`
- V2.8.1 Ice static build: `passed_with_warnings_protected_config_caveat`
- V2.8.1 Ice static output validation: `failed_expected_publish_blocker`
- V2.8.1 Runtime QA evidence run: `runtimeqa_85a8b84955410b83`
- V2.8.1 Runtime QA evidence validation: `passed_with_1_warning`
- V2.8.1 Resource Registry operational binding validator: `passed`
- V2.8.1 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.1 OLM_STAGING current-session env contract: `blocked_missing_10_fields`
- V2.8.1 provider data writes: `0`
- V2.8.1 CMS writes: `0`
- V2.8.1 Azure infrastructure mutations: `0`
- V2.8.1 RBAC assignments: `0`
- V2.8.1 deployment/DNS/indexing/live publication actions: `0`
- V2.8.2 Ice canonical routes: `/`, `/contact`, `/service-areas`
- V2.8.2 Ice obsolete seed routes removed: `/ice-rink-rentals`, `/events-holiday-activations`
- V2.8.2 Ice local seed validation: `passed_3_page_documents`
- V2.8.2 Ice static source validation: `passed_with_34_warnings`
- V2.8.2 Roller static source validation: `passed_with_31_warnings_paused_tenant_safety_check`
- V2.8.2 tenant website type-check: `passed`
- V2.8.2 Ice static build: `passed_with_warnings_protected_config_caveat`
- V2.8.2 Ice static artifact generation: `passed_with_35_quality_warnings`
- V2.8.2 Ice static output validation: `passed_zero_errors_zero_warnings`
- V2.8.2 Ice staging package validation: `passed_zero_errors_zero_warnings`
- V2.8.2 Runtime QA evidence run: `runtimeqa_3bb02639b61fe9d9`
- V2.8.2 Runtime QA evidence validation: `passed_with_1_warning`
- V2.8.2 Resource Registry operational binding validator: `passed`
- V2.8.2 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.2 touched-seed write-command scan: `passed_no_matches`
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
- V2.8.3 Runtime QA evidence validation: `passed_with_1_warning`
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
- V2.8.4 Runtime QA evidence validation: `passed_with_1_warning`
- V2.8.4 Resource Registry operational binding validator: `passed`
- V2.8.4 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.4 provider data writes: `0`
- V2.8.4 CMS writes: `0`
- V2.8.4 Azure infrastructure mutations: `0`
- V2.8.4 RBAC assignments: `0`
- V2.8.4 deployment/DNS/indexing/live publication actions: `0`
- V2.8.5 sanitized no-dotenv static build path: `passed`
- V2.8.5 sanitized build run: `sanitized_20260612144750`
- V2.8.5 protected config copied: `false`
- V2.8.5 protected config contents read: `false`
- V2.8.5 child environment allowlist only: `true`
- V2.8.5 static validate in sanitized workspace: `passed`
- V2.8.5 Next static build in sanitized workspace: `passed`
- V2.8.5 static generate in sanitized workspace: `passed`
- V2.8.5 sanitized static output validator: `blocked_missing_static_form_endpoint_verification`
- V2.8.5 sanitized staging package validator: `blocked_missing_static_form_endpoint_verification`
- V2.8.5 contact-form owner verification: `blocked_owner_verification_required`
- V2.8.5 media/content final approval: `blocked_owner_approval_required`
- V2.8.5 exact staging target approval: `blocked_target_approval_required`
- V2.8.5 provider data writes: `0`
- V2.8.5 CMS writes: `0`
- V2.8.5 Azure infrastructure mutations: `0`
- V2.8.5 RBAC assignments: `0`
- V2.8.5 deployment/DNS/indexing/live publication actions: `0`
- V2.8.6 validator gate classification: `complete`
- V2.8.6 sanitized build run: `sanitized_20260612151525`
- V2.8.6 local static integrity: `passed`
- V2.8.6 external approval gates: `blocked`
- V2.8.6 static output classifier: `blocked_external_approval_gate`
- V2.8.6 staging package classifier: `blocked_external_approval_gate`
- V2.8.6 Runtime QA evidence run: `runtimeqa_67425f67f7a4c3d7`
- V2.8.6 Runtime QA evidence validation: `passed_with_1_warning`
- V2.8.6 Resource Registry operational binding validator: `passed`
- V2.8.6 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.6 contact-form owner verification: `blocked_owner_verification_required`
- V2.8.6 media/content final approval: `blocked_owner_approval_required`
- V2.8.6 exact staging target approval: `blocked_target_approval_required`
- V2.8.6 provider data writes: `0`
- V2.8.6 CMS writes: `0`
- V2.8.6 Azure infrastructure mutations: `0`
- V2.8.6 RBAC assignments: `0`
- V2.8.6 deployment/DNS/indexing/live publication actions: `0`
- V2.8.7 approval record closure: `complete_local_records_execution_blocked`
- V2.8.7 contact-form endpoint configuration: `unresolved_candidate_recorded`
- V2.8.7 contact-form backend verification: `blocked`
- V2.8.7 contact-form owner approval: `unresolved`
- V2.8.7 media/content final approval: `unresolved`
- V2.8.7 staging deployment target decision: `unresolved`
- V2.8.7 DNS gate: `closed`
- V2.8.7 indexing gate: `closed`
- V2.8.7 live-publication gate: `closed`
- V2.8.7 staging execution classification: `local_static_ready_external_approvals_blocked`
- V2.8.7 provider data writes: `0`
- V2.8.7 CMS writes: `0`
- V2.8.7 Azure infrastructure mutations: `0`
- V2.8.7 RBAC assignments: `0`
- V2.8.7 deployment/DNS/indexing/live publication actions: `0`
- V2.8.8 validator hardening: `complete`
- V2.8.8 sanitized build run: `sanitized_20260612171036`
- V2.8.8 local static integrity: `passed`
- V2.8.8 static form gate status: `blocked_endpoint_missing`
- V2.8.8 current-session endpoint/approval flags: `absent`
- V2.8.8 candidate endpoint probe: `blocked_owner_approval_missing`
- V2.8.8 contact-form endpoint configuration: `unresolved_candidate_recorded_no_current_session_value`
- V2.8.8 contact-form backend verification: `blocked_no_live_or_backend_verification_approval`
- V2.8.8 contact-form owner approval: `unresolved`
- V2.8.8 media/content final approval: `unresolved`
- V2.8.8 staging deployment target decision: `unresolved`
- V2.8.8 DNS gate: `closed`
- V2.8.8 indexing gate: `closed`
- V2.8.8 live-publication gate: `closed`
- V2.8.8 staging execution classification: `local_static_ready_static_form_and_owner_approvals_blocked`
- V2.8.8 provider data writes: `0`
- V2.8.8 CMS writes: `0`
- V2.8.8 Azure infrastructure mutations: `0`
- V2.8.8 RBAC assignments: `0`
- V2.8.8 deployment/DNS/indexing/live publication actions: `0`
- V2.8.9 sanitized build run: `sanitized_20260612173425`
- V2.8.9 local static integrity: `passed`
- V2.8.9 static form gate status: `blocked_owner_approval_missing`
- V2.8.9 endpoint configuration: `configured_approved_https_shape`
- V2.8.9 external approval gate count: `2`
- V2.8.9 Runtime QA evidence validation: `passed_with_1_warning`
- V2.8.9 Resource Registry operational binding validator: `passed`
- V2.8.9 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.9 staging execution classification: `local_static_ready_candidate_endpoint_configured_owner_backend_media_target_approvals_blocked`
- V2.8.9 provider data writes: `0`
- V2.8.9 CMS writes: `0`
- V2.8.9 Azure infrastructure mutations: `0`
- V2.8.9 RBAC assignments: `0`
- V2.8.9 deployment/DNS/indexing/live publication actions: `0`
- V2.8.10 approval reference: `v2-8-10-user-approved-through-validation`
- V2.8.10 sanitized build run: `sanitized_20260612180602`
- V2.8.10 local static integrity: `passed`
- V2.8.10 static form gate status: `blocked_backend_verification_missing`
- V2.8.10 endpoint owner approval: `approved_for_local_staging_readiness_validation_only`
- V2.8.10 contact-form owner approval: `approved_for_local_staging_readiness_validation_only`
- V2.8.10 media/content final approval: `approved_for_local_staging_readiness_validation_only`
- V2.8.10 backend verification: `blocked_requires_future_live_backend_verification_approval`
- V2.8.10 exact staging target: `unresolved_executable_target_candidate_recorded`
- V2.8.10 Runtime QA evidence run: `runtimeqa_4e5c6b577de55e99`
- V2.8.10 Resource Registry operational binding validator: `passed`
- V2.8.10 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.10 staging execution classification: `partial_local_staging_readiness_owner_media_closed_backend_and_exact_target_blocked`
- V2.8.10 provider data writes: `0`
- V2.8.10 CMS writes: `0`
- V2.8.10 Azure infrastructure mutations: `0`
- V2.8.10 RBAC assignments: `0`
- V2.8.10 deployment/DNS/indexing/live publication actions: `0`
- V2.8.11 Function App metadata: `func-ice-static-contact-20260605` / `rg-ice-static-form-endpoint` / `Running` / HTTPS-only
- V2.8.11 Azure Static Web Apps target: `swa-ice-static-staging` / `rg-ice-static-staging` / `happy-mud-0b375e20f.7.azurestaticapps.net`
- V2.8.11 placeholder SWA target lookup: `rg-pumpkin-static-staging` / `swa-ice-rink-rentals-staging` / `not_found`
- V2.8.11 endpoint bounded checks: `OPTIONS_204`, `HEAD_404`, `GET_404`, `POST_0`, `payload_0`
- V2.8.11 sanitized build run: `sanitized_20260612200048`
- V2.8.11 local static integrity: `passed`
- V2.8.11 static form gate status: `blocked_backend_verification_missing`
- V2.8.11 backend verification: `reachability_preflight_resolved_backend_behavior_blocked_pending_post_form_verification_approval`
- V2.8.11 exact staging target: `resource_target_resolved_operator_rollback_and_deployment_execution_approval_missing`
- V2.8.11 Runtime QA evidence run: `runtimeqa_22fc50f962b9fef0`
- V2.8.11 Resource Registry operational binding validator: `passed`
- V2.8.11 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.11 staging execution classification: `partial_target_resource_resolved_backend_post_check_and_operator_rollback_blocked`
- V2.8.11 provider data writes: `0`
- V2.8.11 CMS writes: `0`
- V2.8.11 Azure infrastructure mutations: `0`
- V2.8.11 RBAC assignments: `0`
- V2.8.11 deployment/DNS/indexing/live publication actions: `0`
- V2.8.11 protected config reads and secret exports: `0`
- V2.8.12 sanitized build run: `sanitized_20260612210034`
- V2.8.12 local static integrity: `passed`
- V2.8.12 static form gate status: `blocked_backend_verification_missing`
- V2.8.12 backend live verification packet: `ready_for_future_approval`
- V2.8.12 synthetic payload proposal: `ready_not_submitted`
- V2.8.12 deployment method: `future_swa_prebuilt_static_artifact_upload_no_execution`
- V2.8.12 staging operator: `not_closed_named_deploy_operator_required`
- V2.8.12 rollback owner: `not_closed_named_rollback_abort_owner_required`
- V2.8.12 CORS OPTIONS checks: `happy_mud_204`, `ice_dev_204`, `production_204`
- V2.8.12 Runtime QA evidence run: `runtimeqa_50d0759d4b62e457`
- V2.8.12 Resource Registry operational binding validator: `passed`
- V2.8.12 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.12 static form endpoint tests: `passed`
- V2.8.12 staging execution classification: `no_go_named_deploy_operator_and_rollback_owner_missing_backend_post_unexecuted`
- V2.8.12 provider data writes: `0`
- V2.8.12 CMS writes: `0`
- V2.8.12 Azure infrastructure mutations: `0`
- V2.8.12 RBAC assignments: `0`
- V2.8.12 POST/contact form submissions/payload submissions: `0`
- V2.8.12 deployment/DNS/indexing/live publication actions: `0`
- V2.8.12 protected config reads and secret exports: `0`
- V2.8.13 staging operator: `PumpkinCMS operator`
- V2.8.13 rollback owner: `PumpkinCMS operator`
- V2.8.13 approved backend endpoint: `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact`
- V2.8.13 approved Origin: `https://happy-mud-0b375e20f.7.azurestaticapps.net`
- V2.8.13 payload classification: `synthetic_non_pii_example_invalid`
- V2.8.13 POST/contact form submissions/payload submissions: `1`
- V2.8.13 broad retries: `0`
- V2.8.13 second POST: `0`
- V2.8.13 backend POST status: `200 OK`
- V2.8.13 backend response classification: `backend_verified_for_staging_readiness`
- V2.8.13 response entryId present: `true`
- V2.8.13 sanitized build run: `sanitized_20260612214857`
- V2.8.13 local static integrity: `passed`
- V2.8.13 static form gate status: `configured_owner_approved_backend_verified`
- V2.8.13 static output validator: `passed_zero_external_gates`
- V2.8.13 staging package validator: `passed_zero_external_gates`
- V2.8.13 Runtime QA evidence run: `runtimeqa_7938bfd68b6d2374`
- V2.8.13 Resource Registry operational binding validator: `passed`
- V2.8.13 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.13 staging execution classification: `ready_for_staging_publish_execution_approval`
- V2.8.13 provider writes outside approved POST: `0`
- V2.8.13 CMS writes: `0`
- V2.8.13 Azure infrastructure mutations: `0`
- V2.8.13 RBAC assignments: `0`
- V2.8.13 deployment/DNS/indexing/live publication actions: `0`
- V2.8.13 protected config reads and secret exports: `0`
- V2.8.13 keys/listKeys, connection strings, SAS: `0`
- V2.8.14 Azure Static Web App target confirmed: `swa-ice-static-staging` / `rg-ice-static-staging` / `happy-mud-0b375e20f.7.azurestaticapps.net`
- V2.8.14 target custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- V2.8.14 deployment classification: `blocked_before_deployment`
- V2.8.14 blocker: `production_custom_domains_attached_to_target`
- V2.8.14 blocker: `deployment_token_not_present_in_current_session`
- V2.8.14 blocker: `swa_cli_not_available`
- V2.8.14 sanitized build run: `sanitized_20260612222605`
- V2.8.14 artifact root: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612222605/repo/apps/ice-rink-web/out`
- V2.8.14 artifact file count: `41`
- V2.8.14 artifact aggregate SHA-256: `ad2917480ac7df3b19289153894b35f54fd58b382d69d03afc918e5a037d3201`
- V2.8.14 static output validator: `passed_zero_external_gates`
- V2.8.14 staging package validator: `passed_zero_external_gates`
- V2.8.14 Runtime QA evidence run: `runtimeqa_b459ecae015b5e4a`
- V2.8.14 Resource Registry operational binding validator: `passed`
- V2.8.14 OLM provider profile check: `passed_live_write_allowed_false`
- V2.8.14 deployment executed: `0`
- V2.8.14 post-deploy route checks: `0`
- V2.8.14 contact form submissions/contact endpoint POST: `0`
- V2.8.14 provider writes: `0`
- V2.8.14 CMS writes: `0`
- V2.8.14 Azure infrastructure creation/configuration mutations: `0`
- V2.8.14 RBAC assignments: `0`
- V2.8.14 deployment/DNS/indexing/live publication actions: `0`
- V2.8.14 protected config reads, deployment token prints/exports, keys/listKeys, connection strings, SAS: `0`
- V2.8.14A isolated SWA target created: `swa-ice-static-isolated-staging`
- V2.8.14A isolated SWA default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- V2.8.14A isolated SWA custom domains: `0`
- V2.8.14A deployment auth present: `false`
- V2.8.14A deployment executed: `0`
- V2.8.14A DNS/custom-domain/app-settings/RBAC mutations: `0`
- V2.8.14A protected config reads, deployment token prints/exports/listing, keys/listKeys, connection strings, SAS: `0`
- V2.8.14B isolated SWA target confirmed: `swa-ice-static-isolated-staging`
- V2.8.14B deployment auth present: `false`
- V2.8.14B sanitized build run: `sanitized_20260612231928`
- V2.8.14B artifact aggregate SHA-256: `7e83c6c66d24f9087e74c77ee2eb958fdcb18a54893172ef9e8fb9410f399a82`
- V2.8.14B deployment executed: `0`
- V2.8.14B post-deploy route checks: `0`
- V2.8.14B Azure infrastructure creation/configuration mutations: `0`
- V2.8.14B DNS/custom-domain/app-settings/RBAC mutations: `0`
- V2.8.14B protected config reads, deployment token prints/exports/listing, keys/listKeys, connection strings, SAS: `0`
- V2.8.14C isolated SWA target confirmed: `swa-ice-static-isolated-staging`
- V2.8.14C deployment auth present: `true`
- V2.8.14C sanitized build run: `sanitized_20260612235412`
- V2.8.14C artifact aggregate SHA-256: `91b4158db0bfaa97922aaf22b367a2834ca11f7012ffaf6b3152adddb16c2c21`
- V2.8.14C deployment executed: `1`
- V2.8.14C post-deploy route checks: `3_passed_200_ok`
- V2.8.14C Azure infrastructure creation/configuration mutations beyond scoped static artifact deployment: `0`
- V2.8.14C DNS/custom-domain/app-settings/RBAC mutations: `0`
- V2.8.14C protected config reads, deployment token prints/exports/listing/logging, keys/listKeys, connection strings, SAS: `0`
- V2.8.15 isolated staging final route checks: `3_passed_200_ok`
- V2.8.15 Runtime QA evidence run: `runtimeqa_9eec1c74e9e0890b`
- V2.8.15 owner/operator staging signoff: `signed_off_for_isolated_staging_only`
- V2.8.15 V2.8 final staging readiness decision: `v2_8_isolated_staging_ready`
- V2.8.15 redeployment/deployment actions: `0`
- V2.8.15 DNS/custom-domain/app-settings/RBAC/Azure config mutations: `0`
- V2.8.15 protected config reads, deployment credential use/prints/exports/listing, keys/listKeys, connection strings, SAS: `0`
- V2.8.16 production release planning classification: `v2_8_isolated_staging_complete_production_release_planned`
- V2.8.16 recommended first production strategy: `future_explicit_deployment_to_existing_production_domain_swa_target`
- V2.8.16 existing production-domain target: `swa-ice-static-staging`
- V2.8.16 existing production-domain target custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- V2.8.16 isolated staging target custom domains: `0`
- V2.8.16 Runtime QA evidence run: `runtimeqa_96c9902e1d951beb`
- V2.8.16 production deployment approved: `false`
- V2.8.16 DNS/custom-domain/indexing/live-publication gates: `closed`
- V2.8.16 deployment/redeployment actions: `0`
- V2.8.16 protected config reads, deployment credential use/prints/exports/listing, keys/listKeys, connection strings, SAS: `0`
- V2.8.17 production release classification: `production_deployment_failed`
- V2.8.17 production target: `swa-ice-static-staging` / `rg-ice-static-staging`
- V2.8.17 production target custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- V2.8.17 sanitized build run: `sanitized_20260613014405`
- V2.8.17 artifact aggregate SHA-256: `b525b9fc70f32206c17b860a4f29579a26c350394272171bb021a2904fd2b042`
- V2.8.17 Runtime QA evidence run: `runtimeqa_b876ce99824cee8e`
- V2.8.17 deployment auth present: `true`
- V2.8.17 deployment executed attempts: `1`
- V2.8.17 deployment result: `failed_exit_code_1`
- V2.8.17 broad retries: `0`
- V2.8.17 production route checks: `not_run_deployment_failed`
- V2.8.17 DNS/custom-domain/indexing gates: `closed`
- V2.8.17 contact form submissions/contact endpoint POST: `0`
- V2.8.17 protected config reads, deployment token prints/exports/listing/logging, keys/listKeys, connection strings, SAS: `0`
- V2.8.17A production release classification: `blocked_token_target_ambiguous`
- V2.8.17A production target reconfirmed: `swa-ice-static-staging` / `rg-ice-static-staging`
- V2.8.17A production target custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- V2.8.17A corrected dry-run result: `deployment_token_provided_was_invalid`
- V2.8.17A sanitized build run: `sanitized_20260613020714`
- V2.8.17A artifact aggregate SHA-256: `bc48cad4d1b23721781e97b8690b85bef12861450b5ca6c9df8f159dffe71044`
- V2.8.17A deployment auth present: `true`
- V2.8.17A corrective deployment executed attempts: `0`
- V2.8.17A production route checks: `not_run_no_successful_corrective_deployment`
- V2.8.17A DNS/custom-domain/indexing gates: `closed`
- V2.8.17A contact form submissions/contact endpoint POST: `0`
- V2.8.17A protected config reads, deployment token prints/exports/listing/logging, keys/listKeys, connection strings, SAS: `0`
