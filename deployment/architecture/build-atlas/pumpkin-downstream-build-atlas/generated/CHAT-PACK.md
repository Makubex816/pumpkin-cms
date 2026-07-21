# PumpkinCMS Current-System Chat Pack v4.0.0

Startup protocol: read this pack before acting. Report `READY`, `READY_WITH_WARNINGS`, or `BLOCKED`; then name active authority, hard stops, preserved dirty-worktree boundary, latest runtime/read-only evidence, successor lanes, and first safe gate.

This pack is generated from the canonical Build Atlas v4.0.0 and does not authorize runtime mutations.

---

# SOURCE: `00-START-HERE.md`

# Pumpkin downstream Build Atlas v4.0.0

Status: `complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete`

This is the first active canonical comprehensive Build Atlas for PumpkinCMS. It was established prospectively by CUR-20-A04 at `deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/`. It is not backdated over A01, A02, A03, V2.8.61K, or CRSTUR.

Read in this order:

1. `VERSION.json`
2. `.project-ops/02-CURRENT-STATE.json`
3. `.project-ops/03-CURRENT-PHASE.yaml`
4. `.project-ops/05-RESUMPTION-CAPSULE.md`
5. `atlas/atlas.json`
6. `atlas/resource-protection-register.json`
7. `generated/CHAT-PACK.md`
8. `working-memory/PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.md`

Authority model: v3 is imported source material corrected by A04; V2.8.61K remains historical resource inventory/protection baseline; CRSTUR remains identity/capacity/customer-preservation carryforward; UP-20, IDM-40, PERF-10, and PAY-00 are retained for successor prompts and are not started here.

---

# SOURCE: `32-CUR-20-A04-CANONICAL-INCEPTION-OVERLAY.md`

# CUR-20-A04 canonical inception overlay

A04 resolves the authority gap left by CUR-20/A01-A03. The owner authorized a prospective comprehensive Build Atlas, and this package is that Atlas.

## Key decisions

- Canonical path: `deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/`
- Version: `4.0.0`
- Authority start: the first Git commit adding this path with message `docs: establish canonical Pumpkin comprehensive build atlas`
- Prior v3 bridge: promoted as source material only after A04 overlay corrections
- Prior V2.8.61K resource Atlas: retained as historical resource/protection baseline
- CRSTUR: retained as current identity/capacity/customer-preservation carryforward
- Source ZIPs: original ZIP files not present in current workspace; A01 committed hash/CRC evidence is preserved and extracted input trees are present

## Fresh A04 observations

- Azure control-plane readback succeeded for 14 protected named resources.
- Production App Service plan is Standard `S2` with capacity `2`.
- API, Admin, and isolated Admin apps are `Running` in control-plane metadata.
- API health GET returned 200 and dependency readiness GET `/health/ready` returned 200.
- Admin root GET returned 200.
- Isolated Admin root timed out once and returned 200 on immediate retry.
- Ice SWA default/apex/www GET probes returned 200.
- No Airstrip public runtime probe was made.
- Upstream `SDI-AI/pumpkin-cms` `main` moved to `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e` (`Adopt Apache 2.0 license`) and remains unfrozen/not ingested.

---

# SOURCE: `.project-ops/00-OPERATING-CONTRACT.md`

# Operating contract

This directory is the control layer for the active Pumpkin Build Atlas v4.0.0.

A04 established the first active canonical comprehensive Build Atlas prospectively. Earlier v3 bridge files are historical inputs when contradicted by A04 current-state registers.

Rules:

1. Treat live systems as protected until an owner prompt gives narrower authority.
2. Prefer read-only evidence and committed manifests over memory.
3. Never present proposed upstream work as qualified or integrated.
4. Preserve dirty worktree state; never use broad staging for closeout packages.
5. Record every successor attempt in this Atlas or in a closeout run that points back here.

---

# SOURCE: `.project-ops/01-PROJECT-ARCHITECTURE.md`

# Project architecture

PumpkinCMS currently has four major planes: product/source, runtime, governance, and future intake lanes. A04 does not merge code or move runtime. It reconciles the governance plane so later work starts from a single authoritative map.

---

# SOURCE: `.project-ops/02-CURRENT-STATE.json`

{
  "schemaVersion": "4.0.0",
  "generatedAtUtc": "2026-07-21T03:05:00Z",
  "status": "complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete",
  "canonicalAtlas": {
    "path": "deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/",
    "version": "4.0.0",
    "authorityBeginsAt": "first_commit_that_adds_this_canonical_path",
    "previousActiveComprehensiveBuildAtlas": "none_identified_by_A01_A02_A03",
    "v3BridgeRoleBeforeA04": "proposed_bridge_input_only",
    "v3BridgeRoleAfterA04": "promoted_by_owner_authority_into_active_canonical_atlas_with_A04_overlay"
  },
  "repository": {
    "path": "C:\\Users\\User\\Desktop\\PumpkinCMS\\pumpkin-cms",
    "branch": "feature/admin-page-editor-import-export",
    "entryHead": "e50bda6aa3fc08c92c808a00e892ad66d1e8526c",
    "activeGitOperationAtEntry": false,
    "dirtyWorktreePreserved": true,
    "commitModel": [
      "commit canonical atlas exact path only",
      "commit A04 closeout exact path only"
    ]
  },
  "runtimeReadback": {
    "collectedAtUtc": "2026-07-21T02:58:50.1877953Z",
    "appServicePlan": {
      "capacity": 2,
      "kind": "linux",
      "location": "Central US",
      "name": "asp-pumpkin-api-prod-centralus-001",
      "numberOfSites": null,
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "sku": "S2",
      "status": null,
      "tier": "Standard"
    },
    "protectedResourceCount": 14,
    "health": {
      "apiHealth": 200,
      "apiDependencyReadiness": 200,
      "apiRoot": 200,
      "adminRoot": 200,
      "adminIsolatedInitial": null,
      "adminIsolatedRetry": 200,
      "iceSwaRoot": 200,
      "iceApex": 200,
      "iceWww": 200
    },
    "mutationBoundary": "GET_only_or_control_plane_show_list; no appsettings, keys, connection strings, POST, deploy, restart, scale, slot swap, DNS, TLS, indexing, CMS, identity, tenant, payment, or form mutation"
  },
  "identityAndCapacityCarryforward": {
    "source": "V2.8.63CRSTUR committed manifest",
    "apiDeploymentId": "c9451f4b-0b2e-44bc-9d08-ac9b767a6c05",
    "rollbackSlot": {
      "name": "crr-validation",
      "state": "Running",
      "deploymentId": "f6bdf0d7-ca60-4e7f-818c-f4c74a710a86",
      "preserved": true
    },
    "adminDeploymentId": "8c960132-3521-45c7-9a16-d5265ddbb640",
    "managementActivation": {
      "successfulAttempt": 11,
      "stagesCompleted": 7,
      "managementActive": true,
      "allSevenStageFlagsActive": true,
      "foundationDualReadDualWriteActive": true,
      "renameMigrationAndExternalProviderHeld": true,
      "tenantAdminTransferPilot": "held",
      "finalAdminLiveConflict": "held-no-synthetic-only-tenant",
      "syntheticCleanupIdempotent": true,
      "customerCredentialMutations": 0,
      "customerMembershipMutations": 0,
      "customerOwnershipMutations": 0,
      "airstripPublicRequests": 0,
      "completedAtUtc": "2026-07-16T13:47:40.1475740Z"
    },
    "finalFeatureState": {
      "identityFoundation": true,
      "dualRead": true,
      "dualWrite": true,
      "management": true,
      "passwordAndSessionManagement": true,
      "tenantSwitcher": true,
      "membershipManagement": true,
      "contactManagement": true,
      "superAdminManagement": true,
      "providerAwareEmailRequests": true,
      "tenantRename": false,
      "migrationExecution": false,
      "externalNotificationProvider": false,
      "capacityDiagnostics": false,
      "twoWorkersVerified": true
    },
    "customerPreservation": {
      "tenants": 4,
      "accounts": 6,
      "memberships": 8,
      "contacts": 4,
      "formEntries": 12,
      "pendingReconciliations": 0,
      "pendingSecurityMutations": 0,
      "pendingSyntheticOperations": 0,
      "pendingAudits": 0,
      "reconciliationClear": true,
      "verifiedAtUtc": "2026-07-16T14:07:13.4956019Z"
    },
    "capacity": {
      "s1Attempted": true,
      "s1Failure": "TenantAdmin sequential login cycle 5 returned no HTTP response after 30013 ms",
      "s1Window": {
        "startedAtUtc": "2026-07-16T13:56:47.7856714Z",
        "endedAtUtc": "2026-07-16T13:58:13.7486907Z",
        "maxCpuMinuteAveragePercent": 10,
        "maxMemoryMinuteAveragePercent": 72.5,
        "maxHttpQueueLength": 0
      },
      "finalDecision": "retain_s2_two_workers_with_evidence",
      "finalSku": "S2",
      "finalWorkerCount": 2,
      "s2RecoveryRuntimePassed": true,
      "s2RecoveryMaxCpuMinuteAveragePercent": 61,
      "s2RecoveryMaxMemoryMinuteAveragePercent": 56.666666666666664
    }
  },
  "upstream": {
    "repository": "https://github.com/SDI-AI/pumpkin-cms.git",
    "branch": "main",
    "priorA01ObservedHead": "817e176cd6af7759c58923c713c5b8ac7cf79996",
    "currentObservedHead": "fda4611f6ca5a6206e3e8d6254e3e41c3b50618e",
    "currentTree": "08f1ecdb73c846564c2a0f3de889b66775e8ae5c",
    "currentCommitDate": "2026-07-20T19:02:07-04:00",
    "currentSubject": "Adopt Apache 2.0 license",
    "movedFromPriorObservedHead": true,
    "classification": "observed_unfrozen_not_ingested_not_qualified"
  },
  "futureLanes": {
    "UP-20": "not_started_retain_for_successor_prompt",
    "IDM-40": "not_started_retain_for_successor_prompt",
    "PERF-10": "not_started_retain_for_successor_prompt",
    "PAY-00": "not_started_retain_for_successor_prompt"
  }
}

---

# SOURCE: `.project-ops/03-CURRENT-PHASE.yaml`

phaseId: CUR-20-A04
version: 4.0.0
status: complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete
objective:
  primary: Establish the first active canonical comprehensive Pumpkin Build Atlas prospectively.
scope:
  in: [documentation and Atlas artifact generation, read-only Azure control-plane evidence, GET-only runtime evidence, deterministic package generation in ignored release workspace]
  out: [deployment, restart, slot swap, scale, appsetting, feature-flag, identity, tenant, CMS, form, DNS, TLS, indexing, Airstrip runtime, payment mutation]
mutationBudgets:
  liveAzureWrites: { allowed: 0, consumed: 0 }
  deploysOrRestarts: { allowed: 0, consumed: 0 }
  slotSwaps: { allowed: 0, consumed: 0 }
  appSettingsOrSecretsReads: { allowed: 0, consumed: 0 }
  tenantOrCustomerDataWrites: { allowed: 0, consumed: 0 }
  formPosts: { allowed: 0, consumed: 0 }
  paymentTransactions: { allowed: 0, consumed: 0 }
  gitCommits: { allowed: 2, consumed: 0_until_committed }
gates:
  - { id: A04-AUTHORITY, status: passed }
  - { id: V3-BRIDGE-INTEGRITY, status: passed_with_limitation, evidence: A01 committed SHA/CRC plus extracted input tree }
  - { id: V2-8-61K-CARRYFORWARD, status: passed }
  - { id: CRSTUR-CARRYFORWARD, status: passed }
  - { id: LIVE-READBACK, status: passed }
  - { id: UPSTREAM-RECHECK, status: observed_unfrozen_not_ingested }
  - { id: RELEASE-DETERMINISM, status: pending_until_A04_closeout }
hardStops:
  - do not overwrite or delete existing owner/user work
  - do not read protected settings, secrets, keys, or connection strings
  - do not mutate Azure, DNS, TLS, tenant data, identity data, forms, indexing, Airstrip public runtime, or payment systems
  - do not stage unrelated dirty worktree paths
nextSafeGate: Commit canonical Atlas exact path, build release artifacts twice from committed source, then commit A04 closeout exact path.

---

# SOURCE: `.project-ops/04-EVIDENCE-INDEX.json`

{
  "schemaVersion": "4.0.0",
  "generatedAtUtc": "2026-07-21T03:05:00Z",
  "classification": "a04_canonical_inception_evidence_index",
  "entries": [
    {
      "id": "EV-A04-AUTH",
      "path": "owner attachment e63f705a-6288-46c7-a086-3a8b38f44248/pasted-text.txt",
      "role": "authorization_prompt",
      "committed": false
    },
    {
      "id": "EV-A01-MANIFEST",
      "path": "deployment/architecture/platform-closeout/cur-20-current-build-closeout-ingestion-result/result-manifest.json",
      "sha256": "9a3ed41ac2ee84f22a080a116784e9a220e9147590b10db28c8a88ec519fe005",
      "role": "source ZIP hash/CRC and blocked A01 record",
      "committed": true
    },
    {
      "id": "EV-A02-MANIFEST",
      "path": "deployment/architecture/platform-closeout/cur-20-current-build-closeout-ingestion-result/runs/a02-parent-workspace-resource-audit/result-manifest.json",
      "sha256": "95ddf6c7c4b1a711dc1db4e30f3eb1d0e949a2702f364191efff6d7b876a1750",
      "role": "accepted parent workspace audit",
      "committed": true
    },
    {
      "id": "EV-A03-MANIFEST",
      "path": "deployment/architecture/platform-closeout/cur-20-current-build-closeout-ingestion-result/runs/a03-v2-8-61k-resource-atlas-targeted-recovery/result-manifest.json",
      "sha256": "2aa3999922e17ddb1c820ee78b1232d03556ae7b0edbdae71f5f27ecedef9bf2",
      "role": "targeted recovery and authority classification",
      "committed": true
    },
    {
      "id": "EV-V2-8-61K",
      "path": "deployment/architecture/tenant-website-publish-readiness/v2-8-61k-platform-resource-atlas-result/result-manifest.json",
      "sha256": "3068c2a69c20857c2ac9fcb316f252fa430501923a9f3eb59ef9ca1e1c7c73d1",
      "role": "historical resource protection baseline",
      "committed": true
    },
    {
      "id": "EV-CRSTUR",
      "path": "deployment/architecture/identity/v2-8-63crstu-readiness-identity-activation-result/result-manifest.json",
      "sha256": "75501728f63438d6dffb8e084ceb7a1bb94713688e73c2a20cc3f62c7d139601",
      "role": "identity activation and capacity carryforward",
      "committed": true
    },
    {
      "id": "EV-A04-AZURE",
      "path": "evidence/a04-live-control-plane-readback-2026-07-21.json",
      "sha256": "0505e8ec839fd91c3df7d912a9d360c18c9201587925d0c331be63ae45c4e85d",
      "role": "fresh read-only Azure control-plane readback",
      "committed": true
    },
    {
      "id": "EV-A04-HTTP",
      "path": "evidence/a04-live-http-get-probes-2026-07-21.json",
      "sha256": "eb0c5389b972a800eaae6c12e3d7c9258ec874290cf51cd0878a84eff3290cc7",
      "role": "fresh GET-only health/root probes",
      "committed": true
    },
    {
      "id": "EV-A04-UPSTREAM",
      "path": "evidence/a04-upstream-recheck-2026-07-21.json",
      "sha256": "1276d8a6fc8a987e20c1342282dce1729d119d8de5379efea0dc3d36d74e808e",
      "role": "isolated upstream main recheck",
      "committed": true
    },
    {
      "id": "EV-A04-ZIP-SEARCH",
      "path": "evidence/a04-source-zip-search-2026-07-21.json",
      "sha256": "17173673b0315e1e9d6a134b5740e0f42974c5e7462a6551ebe4eb86f141a39b",
      "role": "current workspace source ZIP search limitation",
      "committed": true
    }
  ]
}

---

# SOURCE: `.project-ops/05-RESUMPTION-CAPSULE.md`

# CUR-20-A04 resumption capsule

Status: `complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete` once both required A04 commits exist.

The canonical Atlas now lives at `deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/` and begins prospectively at the first commit that adds that path. It is not backdated. A01, A02, and A03 remain truthful historical records.

Current runtime carryforward:

- API production app: `app-pumpkin-api-prod-centralus-001`, GET `/health` 200 and `/health/ready` 200 on 2026-07-21.
- Admin production app: `app-pumpkin-admin-prod-centralus-001`, root GET 200.
- Admin isolated proof app: first GET timed out, immediate retry GET 200.
- App Service plan: `asp-pumpkin-api-prod-centralus-001`, Standard `S2`, capacity `2`.
- CRSTUR identity management active, seven staged flags active, tenant-admin transfer pilot held, tenant rename/migration/external provider held, final decision retain S2/two workers.
- Customer preservation from CRSTUR: tenants 4, accounts 6, memberships 8, contacts 4, form entries 12, pending reconciliation/security/synthetic/audit work 0.

Strict boundaries: no deploy/restart/scale/swap/appsettings/feature-flag/tenant/CMS/form/DNS/TLS/indexing/Airstrip/payment mutation without a fresh owner prompt. Treat upstream `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e` as observed, unfrozen, and not ingested.

---

# SOURCE: `.project-ops/08-VALIDATION-MATRIX.yaml`

matrixVersion: 4.0.0
checks:
  - { id: json-yaml-parse, status: passed_by_tools_validate_package }
  - { id: package-manifest-and-checksum, status: passed_by_tools_validate_package }
  - { id: source-zip-integrity, status: passed_with_limitation, note: original ZIPs absent; A01 committed SHA/CRC evidence preserved and extracted input trees present }
  - { id: azure-readonly, status: passed }
  - { id: runtime-get-probes, status: passed }
  - { id: upstream-recheck, status: observed_unfrozen_not_ingested }
  - { id: deterministic-release, status: pending_until_release_workspace_run }
  - { id: no-zip-committed, status: passed_if_git_status_has_no_zip_under_canonical_path }

---

# SOURCE: `.project-ops/11-NEXT-PHASE-MAP.md`

# Next phase map

A04 closes CUR-20 by creating the active Atlas. It does not start successor work.

| Lane | State | First safe successor action |
| --- | --- | --- |
| UP-20 | not started | Recheck, freeze, and qualify upstream `SDI-AI/pumpkin-cms` only after fresh authority. |
| IDM-40 | not started | Plan identity continuation using CRSTUR feature/capacity carryforward. |
| PERF-10 | not started | Analyze S2/two-worker telemetry and cost only; no scale change without approval. |
| PAY-00 | not started | Authorize.Net/payment intake remains architecture/planning only. |

---

# SOURCE: `atlas/ATLAS.md`

# Pumpkin Build Atlas v4.0.0

This is the human-readable index for the canonical Atlas established by CUR-20-A04.

Current status: `complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete`

The Atlas reconciles the v3 bridge package, v0.9 working-memory package, V2.8.61K resource Atlas, CRSTUR identity/capacity closeout, and A04 fresh read-only evidence. The full legacy phase census/crosswalk contains 352 unique identifiers in `atlas/legacy-phase-crosswalk.json`.

A04 did not start UP-20, IDM-40, PERF-10, or PAY-00. Those are successor lanes only.

---

# SOURCE: `atlas/atlas.json`

{
  "schemaVersion": "4.0.0",
  "atlasVersion": "4.0.0",
  "generatedAtUtc": "2026-07-21T03:05:00Z",
  "status": "complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete",
  "program": "Pumpkin downstream product, tenant runtime, governance, identity, upstream-intake, performance, and payment roadmap",
  "authorityNote": "First active canonical comprehensive Build Atlas, established prospectively by CUR-20-A04. Earlier package files imported from v3 are historical inputs when contradicted by A04 current-state registers.",
  "canonicalPath": "deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/",
  "sourceHierarchy": [
    {
      "rank": 1,
      "source": "A04 owner authorization and committed canonical Atlas v4.0.0"
    },
    {
      "rank": 2,
      "source": "Committed CRSTUR result manifest for identity/capacity/customer preservation"
    },
    {
      "rank": 3,
      "source": "Recovered V2.8.61K platform resource Atlas for historical resource protection"
    },
    {
      "rank": 4,
      "source": "A01/A02/A03 closeout records for provenance and limitations"
    },
    {
      "rank": 5,
      "source": "Imported v3 bridge and v0.9 working memory as source material only"
    }
  ],
  "repositories": {
    "activeDownstream": {
      "path": "C:\\Users\\User\\Desktop\\PumpkinCMS\\pumpkin-cms",
      "branch": "feature/admin-page-editor-import-export",
      "entryHead": "e50bda6aa3fc08c92c808a00e892ad66d1e8526c"
    },
    "publicOrigin": {
      "repository": "Makubex816/pumpkin-cms",
      "remote": "origin"
    },
    "upstream": {
      "repository": "https://github.com/SDI-AI/pumpkin-cms.git",
      "branch": "main",
      "currentObservedHead": "fda4611f6ca5a6206e3e8d6254e3e41c3b50618e",
      "classification": "observed_unfrozen_not_ingested_not_qualified"
    }
  },
  "currentStateRef": ".project-ops/02-CURRENT-STATE.json",
  "resourceMapRef": "atlas/resource-map.json",
  "resourceProtectionRef": "atlas/resource-protection-register.json",
  "legacyPhaseCrosswalkRef": "atlas/legacy-phase-crosswalk.json",
  "workingMemoryRef": "working-memory/PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.md",
  "chatPackRef": "generated/CHAT-PACK.md",
  "currentGates": [
    {
      "id": "G-A04-AUTHORITY",
      "status": "passed"
    },
    {
      "id": "G-CANONICAL-ATLAS-PATH",
      "status": "passed"
    },
    {
      "id": "G-WORKING-MEMORY-V1",
      "status": "passed"
    },
    {
      "id": "G-CHAT-PACK",
      "status": "passed"
    },
    {
      "id": "G-LIVE-READBACK",
      "status": "passed"
    },
    {
      "id": "G-UPSTREAM-RECHECK",
      "status": "observed_unfrozen_not_ingested"
    },
    {
      "id": "G-RELEASE-DETERMINISM",
      "status": "pending_until_closeout"
    }
  ],
  "nextLanes": [
    "UP-20",
    "IDM-40",
    "PERF-10",
    "PAY-00"
  ]
}

---

# SOURCE: `atlas/resource-protection-register.json`

{
  "schemaVersion": "1.0.0",
  "generatedAtUtc": "2026-07-21T03:05:00Z",
  "source": "A04 read-only control-plane plus V2.8.61K do-not-delete carryforward",
  "entries": [
    {
      "name": "cosmos-pumpkin-prod-eastus",
      "type": "Microsoft.DocumentDB/databaseAccounts",
      "resourceGroup": "rg-ice-production-cosmos",
      "location": "eastus",
      "protectionStatus": "do_not_delete_production_cosmos_data",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "iceskatingmedia",
      "type": "Microsoft.Storage/storageAccounts",
      "resourceGroup": "rg-ice-production-media",
      "location": "eastus",
      "protectionStatus": "do_not_delete_production_tenant_media",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "func-ice-static-contact-20260605",
      "type": "Microsoft.Web/sites",
      "resourceGroup": "rg-ice-static-form-endpoint",
      "location": "eastus",
      "protectionStatus": "do_not_delete_until_dependency_proof_legacy_static_contact_function",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "iceforms20260605",
      "type": "Microsoft.Storage/storageAccounts",
      "resourceGroup": "rg-ice-static-form-endpoint",
      "location": "eastus",
      "protectionStatus": "do_not_delete_until_dependency_proof_legacy_static_contact_storage",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "swa-ice-static-isolated-staging",
      "type": "Microsoft.Web/staticSites",
      "resourceGroup": "rg-ice-static-staging",
      "location": "eastus2",
      "protectionStatus": "do_not_delete_ice_isolated_staging_proof",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "swa-ice-static-staging",
      "type": "Microsoft.Web/staticSites",
      "resourceGroup": "rg-ice-static-staging",
      "location": "eastus2",
      "protectionStatus": "do_not_delete_ice_production_public_website",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "app-airstrip-preview-isolated-centralus-001",
      "type": "Microsoft.Web/sites",
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "location": "centralus",
      "protectionStatus": "do_not_delete_airstrip_frozen_no_public_runtime_probe_without_new_authority",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "app-airstrip-prod-centralus-001",
      "type": "Microsoft.Web/sites",
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "location": "centralus",
      "protectionStatus": "do_not_delete_airstrip_frozen_no_public_runtime_probe_without_new_authority",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "app-pumpkin-admin-isolated-centralus-001",
      "type": "Microsoft.Web/sites",
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "location": "centralus",
      "protectionStatus": "do_not_delete_isolated_admin_proof",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "app-pumpkin-admin-prod-centralus-001",
      "type": "Microsoft.Web/sites",
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "location": "centralus",
      "protectionStatus": "do_not_delete_production_admin_ui",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "app-pumpkin-api-prod-centralus-001",
      "type": "Microsoft.Web/sites",
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "location": "centralus",
      "protectionStatus": "do_not_delete_production_api",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "asp-pumpkin-api-prod-centralus-001",
      "type": "Microsoft.Web/serverFarms",
      "resourceGroup": "rg-pumpkin-api-prod-centralus",
      "location": "centralus",
      "protectionStatus": "do_not_delete_s2_two_worker_plan_after_crstur_capacity_decision",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "cosmos-pumpkincms-stg-olm01",
      "type": "Microsoft.DocumentDB/databaseAccounts",
      "resourceGroup": "rg-pumpkincms-stg-eastus-olm",
      "location": "eastus",
      "protectionStatus": "cleanup_candidate_needs_dependency_proof",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    },
    {
      "name": "pumpkincmsstgolm01",
      "type": "Microsoft.Storage/storageAccounts",
      "resourceGroup": "rg-pumpkincms-stg-eastus-olm",
      "location": "eastus",
      "protectionStatus": "cleanup_candidate_needs_dependency_proof",
      "allowedActionsInA04": [
        "read_control_plane_metadata",
        "GET_health_or_root_only_when_not_airstrip_public"
      ],
      "forbiddenWithoutNewAuthority": [
        "delete",
        "restart",
        "scale",
        "swap",
        "deploy",
        "appsettings_read_or_write",
        "keys_or_connection_strings",
        "role_assignment_change",
        "tenant_or_data_mutation"
      ]
    }
  ],
  "airstripBoundary": "Airstrip remains frozen; A04 made zero public Airstrip runtime requests.",
  "legacyCleanupBoundary": "OLM staging and legacy static contact resources remain cleanup candidates only after dependency proof."
}

---

# SOURCE: `atlas/upstream-intake-state.json`

{
  "schemaVersion": "1.0.0",
  "generatedAtUtc": "2026-07-21T03:05:00Z",
  "v3ObservedCandidate": "18b5cea01d23298b95b5945999e66a4aec8d748b",
  "a01ObservedHead": "817e176cd6af7759c58923c713c5b8ac7cf79996",
  "a04ObservedHead": "fda4611f6ca5a6206e3e8d6254e3e41c3b50618e",
  "a04ObservedTree": "08f1ecdb73c846564c2a0f3de889b66775e8ae5c",
  "a04ObservedSubject": "Adopt Apache 2.0 license",
  "status": "observed_unfrozen_not_ingested_not_qualified",
  "successorGate": "UP-20"
}

---

# SOURCE: `atlas/lanes.json`

{
  "schemaVersion": "1.0.0",
  "generatedAtUtc": "2026-07-21T03:05:00Z",
  "lanes": [
    {
      "id": "CUR-20-A04",
      "state": "complete_after_required_commits",
      "purpose": "canonical Atlas inception"
    },
    {
      "id": "UP-20",
      "state": "not_started",
      "purpose": "upstream recheck/freeze/qualification/integration planning"
    },
    {
      "id": "IDM-40",
      "state": "not_started",
      "purpose": "identity continuation after CRSTUR"
    },
    {
      "id": "PERF-10",
      "state": "not_started",
      "purpose": "performance/capacity/cost analysis after S2 retention"
    },
    {
      "id": "PAY-00",
      "state": "not_started",
      "purpose": "payment architecture/intake only"
    }
  ]
}

---

# SOURCE: `working-memory/PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.md`

# PumpkinCMS Chat Working Memory Master v1.0.0

Generated: `2026-07-21T03:05:00Z`

Canonical Atlas: `deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/`

Status: `complete_prospective_comprehensive_build_atlas_v4_established_working_memory_v1_chat_pack_released_cur20_complete`

CUR-20-A04 established the first active canonical comprehensive Build Atlas prospectively. The v3 bridge package was imported as source material, corrected with A04 authority, and reconciled with V2.8.61K resource protection and CRSTUR identity/capacity evidence.

Facts to carry forward: branch `feature/admin-page-editor-import-export`, entry HEAD `e50bda6aa3fc08c92c808a00e892ad66d1e8526c`, App Service plan `S2` capacity `2`, API health/readiness 200/200, Admin root 200, Ice SWA default/apex/www 200, Airstrip frozen/no-probe, CRSTUR identity management active, customer preservation tenants 4/accounts 6/memberships 8/contacts 4/form entries 12/pending queues 0, upstream `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e` observed but not frozen or integrated, and UP-20/IDM-40/PERF-10/PAY-00 not started.

No deploy/restart/swap/scale/appsettings/feature-flag/tenant/CMS/form/DNS/TLS/indexing/Airstrip/payment mutation without fresh owner authority.

---
