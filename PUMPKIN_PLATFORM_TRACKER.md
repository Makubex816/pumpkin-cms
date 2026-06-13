# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.17D |
| currentReferenceName | Production Deploy Working-Directory Separation Corrective Execution |
| currentReferenceStatus | Complete; corrected production deployment to `swa-ice-static-staging` succeeded from a neutral parent workspace and six bounded production route checks passed |
| provisionalV2OverallCompletion | `95%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.18 |
| nextReferenceName | Production Post-Deployment Owner Verification And Indexing Approval Packet |
| nextGate | Owner post-launch verification and indexing approval packet; Search Console/indexing remain closed until separately approved |
| safetyPosture | V2.8.17D performed boolean-only token checks, read-only target/domain reconfirmation, fresh sanitized artifact validation, neutral parent `app` workspace deployment, exactly one successful SWA CLI production static artifact deployment, and six bounded GET-only production route checks; no DNS change, custom-domain mutation, indexing, contact form submission, contact endpoint POST, crawl, outbound URL check, CMS/provider write, Azure infrastructure/configuration mutation beyond the static artifact deployment, app settings mutation, RBAC assignment, protected config read, deployment token print/export/listing/logging/writing/reveal, keys/listKeys, connection string, SAS, broad retry, or `git add -A` occurred |
| blockedState | Production static deployment is technically verified; owner post-launch signoff, Search Console/indexing, contact form submission, CMS/provider writes, DNS/custom-domain changes, and further Azure mutations remain separately gated |

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
| V2.8 | `production static deployment executed and verified` | Backend verification, isolated target creation, local artifact validation, scoped isolated staging deployment, bounded route checks, validation stack, owner/operator staging signoff, production release planning, V2.8.17 production execution, V2.8.17A forensics, V2.8.17B auth replacement/corrective retry, V2.8.17C command-shape corrective execution, and V2.8.17D working-directory separation corrective deployment are complete; production static deployment succeeded and six production route checks passed, while owner post-launch signoff and indexing remain separately gated |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
