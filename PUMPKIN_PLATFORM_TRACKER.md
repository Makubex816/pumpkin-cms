# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.17A |
| currentReferenceName | Production Deployment Failure Forensics Corrective Retry Boundary |
| currentReferenceStatus | Complete; failure forensics and artifact revalidation passed, but corrective deployment retry blocked before deployment because the current deployment token was rejected as invalid during dry-run |
| provisionalV2OverallCompletion | `94%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.17B |
| nextReferenceName | Production Deployment Auth Replacement And Corrective Retry Approval |
| nextGate | Load/verify a valid production SWA deployment token without revealing it, then request separate explicit approval before any corrective retry |
| safetyPosture | V2.8.17A performed read-only target/domain reconfirmation, token presence checks, corrected SWA CLI dry-run, and local artifact revalidation; no corrective deployment retry was sent because the deployment client rejected the token as invalid; no production route checks, DNS change, custom-domain mutation, indexing, contact form submission, contact endpoint POST, crawl, outbound URL check, CMS/provider write, Azure infrastructure/configuration mutation, app settings mutation, RBAC assignment, protected config read, deployment token print/export/listing, keys/listKeys, connection string, SAS, broad retry, or second corrective retry occurred |
| blockedState | Production release is not verified; corrective deployment retry and route checks were not run because deployment-token validity failed before deployment; any future deployment retry requires separate explicit approval |

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
| V2.8 | `production execution attempted once; retry blocked by invalid token` | Backend verification, isolated target creation, local artifact validation, scoped isolated staging deployment, bounded route checks, validation stack, owner/operator staging signoff, and production release planning are complete; V2.8.17 sent one approved production deployment attempt and it failed before route verification; V2.8.17A completed forensics and blocked the corrective retry because the current token was rejected as invalid |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
