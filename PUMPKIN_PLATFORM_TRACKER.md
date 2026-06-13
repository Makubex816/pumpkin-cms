# Pumpkin Platform Tracker

## Current Visible Tracker

| Field | Value |
| --- | --- |
| currentReference | V2.8.14C |
| currentReferenceName | Deployment Auth Retry And Scoped Isolated Staging Deployment |
| currentReferenceStatus | Complete; isolated target, tooling, fresh artifact gates, single scoped isolated staging deployment, and three bounded route checks passed |
| provisionalV2OverallCompletion | `92%` |
| currentLayerRefs | L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L15 |
| nextReference | V2.8.15 |
| nextReferenceName | Post-Staging Verification And Owner Signoff |
| nextGate | Review only the isolated staging default hostname and three canonical Ice routes for owner/operator signoff; keep production release closed |
| safetyPosture | V2.8.14C performed exactly one scoped static artifact deployment to the isolated target only; no old-target deployment, production-domain deployment, DNS change, custom domain mutation, indexing, live publication, CMS write, provider write, Azure infrastructure creation/configuration mutation beyond the scoped artifact deployment, app settings mutation, RBAC assignment, protected config read, deployment-token print/export/listing/logging/writing, keys/listKeys, connection string, SAS, contact form submission, contact endpoint POST, external crawl, or outbound URL check |
| blockedState | No blocker remains for the scoped isolated staging deployment; production release and post-staging signoff remain separate gates |

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
| V2.8 | `99%` | Backend verification, isolated target creation, repo-supported SWA tooling, local artifact validation, scoped isolated staging deployment, and bounded staging route checks are complete; post-staging signoff is next |
| V2.9 | `20%` | Audit/jobs/production gates future |

These percentages are provisional control-layer indicators, not deployment approval.
