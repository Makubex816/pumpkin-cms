# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.17 |
| currentReferenceName | Production Release Execution Approval |
| currentReferenceStatus | Complete; pre-production gates passed, exactly one production static deployment attempt was sent, and deployment failed before route verification |
| provisionalV2OverallCompletion | `94%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.18 |
| nextReferenceName | Production Deployment Failure Triage And Reattempt Approval |
| nextGate | Triage the SWA CLI deployment binary failure and request separate explicit approval before any reattempt |
| safetyPosture | V2.8.17 sent exactly one production static artifact deployment attempt; it failed with exit code `1`; no retry, production route checks, DNS change, custom domain mutation, indexing, contact form submission, contact endpoint POST, crawl, outbound URL check, CMS write, provider write, Azure infrastructure/configuration mutation beyond the attempted static deployment boundary, app settings mutation, RBAC assignment, protected config read, deployment token print/export/listing, keys/listKeys, connection string, or SAS occurred |
| blockedState | Production release is not verified; route checks were not run because deployment failed; any future deployment reattempt requires separate explicit approval |

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
| V2.8 | `production execution attempted once; deployment failed before verification` | Backend verification, isolated target creation, local artifact validation, scoped isolated staging deployment, bounded route checks, validation stack, owner/operator staging signoff, and production release planning are complete; V2.8.17 sent one approved production deployment attempt and it failed before route verification |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
