# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.17C |
| currentReferenceName | Production Deploy Command Shape Corrective Execution |
| currentReferenceStatus | Complete; pre-deployment gates passed and exactly one corrected production deployment attempt was sent, but production release remains unverified because StaticSitesClient rejected the artifact-root working-directory command shape |
| provisionalV2OverallCompletion | `94%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.17D |
| nextReferenceName | Production Deploy Working-Directory Separation Corrective Execution |
| nextGate | Use a working directory outside the artifact folder for any future approved deployment attempt |
| safetyPosture | V2.8.17C performed boolean-only token presence checks, read-only target/domain reconfirmation, local artifact revalidation, and exactly one corrected SWA CLI production deployment attempt; no dry-run, retry, production route checks, DNS change, custom-domain mutation, indexing, contact form submission, contact endpoint POST, crawl, outbound URL check, CMS/provider write, Azure infrastructure/configuration mutation beyond the failed static artifact deployment attempt, app settings mutation, RBAC assignment, protected config read, deployment token print/export/listing/logging/writing/reveal, keys/listKeys, connection string, SAS, or generated `.tmp` artifact staging occurred |
| blockedState | Production release is not verified; the V2.8.17C corrected deployment attempt failed because the current directory was identical to the artifact folder, route checks were not run, and no retry remains authorized |

## Legacy Tracker Freeze

| Legacy field | Frozen value |
| --- | --- |
| legacyTrackerName | Legacy 2H Tracker v1 |
| frozenValue | `92 / 100` |
| finalLegacyPhase | Phase 2H-24, OLM staging target/resource foundation and Source-of-Truth binding |
| actualStagingWriteExecutionPercent | `100%` for the approved first scoped batch only |
| recordsWritten | `48` |
| readbackRun | `true` |

Do not continue incrementing the old `92 / 100` tracker as the visible platform tracker.

## V2 Completion Model

| Reference | Completion | State |
| --- | --- | --- |
| V2.0 | `100%` | Master reference rebaseline complete |
| V2.1 | `70%` | Source-of-truth governance foundation exists; hardening next |
| V2.2 | `100%` | OLM final stage-ready signoff complete; evidence package frozen |
| V2.3 | `84%` | Staging Azure foundation, DB-scoped Cosmos RBAC, provider profile candidate, OLM contract, and container-scoped Backup Center Storage RBAC proof finalized |
| V2.4 | `87%` | Backup Center proof and QA signoff strong; OLM staging storage proof uploaded |
| V2.5 | `82%` | Resource Registry and provider profiles operationalized for local/read-only control-layer validation |
| V2.6 | `86%` | Runtime QA harness operationalized with reusable registry, evidence manifest, local QA checks, and upload blocker recorded |
| V2.7 | `100%` | Admin/API Operator Console signoff complete; Runtime QA upload blocker resolved |
| V2.8 | `production command-shape corrective attempt failed` | Backend verification, isolated target creation, local artifact validation, scoped isolated staging deployment, bounded route checks, validation stack, owner/operator staging signoff, production release planning, V2.8.17 production execution, V2.8.17A forensics, V2.8.17B auth replacement/corrective retry, and V2.8.17C command-shape corrective execution are complete; production release remains unverified because the V2.8.17C attempt failed before route verification |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
