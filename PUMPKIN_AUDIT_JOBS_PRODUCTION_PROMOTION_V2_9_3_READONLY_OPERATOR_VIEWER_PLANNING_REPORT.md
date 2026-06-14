# Pumpkin Audit Jobs Production Promotion V2.9.3 Read-Only Operator Viewer Planning Report

Status: complete for V2.9.3 local planning and view-model foundation.

Created: 2026-06-13T20:38:26-04:00.

## Scope

V2.9.3 produced a local, read-only operator viewer foundation for the V2.9 audit/job/promotion ledger. It did not add Admin runtime UI, Pumpkin API endpoints, Electron runtime behavior, deployment behavior, indexing behavior, crawling, contact form submission, CMS/provider writes, Azure mutation, protected config reads, tokens, keys, connection strings, or SAS generation.

## Result Package

Result package:

`deployment/architecture/audit-jobs-production-promotion/v2-9-3-audit-job-ledger-readonly-operator-viewer-planning-result/`

Primary implementation package:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/`

## Implementation Summary

- Added `src/audit-job-ledger-view-model.mjs`.
- Added `createLedgerViewerModel(ledger)` for the required summary, panels, detail rows, trace model, warnings, blockers, next gates, and security boundary.
- Added `searchTraceIds(viewerModel, query)` as a pure local search helper.
- Added CLI command `viewer-summary`.
- Added implementation docs for the viewer model and model shape.
- Expanded Node test coverage from 10 tests to 15 tests.

## Viewer State

The combined V2.8/V2.9 fixture produces:

- `summary.status`: `read_only`
- `summary.v2Reference`: `V2.8.19`
- `summary.laneId`: `tenant-website-publish-readiness`
- `summary.tenantKey`: `ice-rink-rentals`
- `summary.siteKey`: `ice-rink-rentals`
- `summary.releaseState`: `complete`
- `summary.indexingState`: `deferred`
- `summary.boundaryState`: `read_only`
- `auditEvents`: 11
- `jobRuns`: 9
- `promotionGates`: 11
- `evidenceBindings`: 13
- `traceEntries`: 107
- `warnings`: 1
- `blockers`: 0
- `nextGates`: 2

## Required Panels

The model emits the required read-only panels:

- Release Summary
- Promotion Gates
- Job Runs
- Audit Events
- Evidence Bindings
- Trace Explorer
- Runtime QA
- Resource Registry / Provider Profile
- Outbound Link Manager
- Backup Center
- Indexing Deferred
- Blockers and Next Gates

## Carryforward

- V2.9.2 validator foundation remains the validation base.
- Google/Search Console/indexing remains deferred.
- Future boundary remains required before any runtime or write-capable phase.

## Validation

Validation is summarized in `validation-summary.md`. Final validation passed for the V2.9.3 scoped files, including JSON parsing, Node syntax checks, package check/test, valid and invalid CLI fixtures, viewer-summary CLI, scoped diff hygiene, secret-like scan, path-name guard, `.tmp` check, and no staged files.

## Tracker Recommendation

Mark V2.9.3 complete. Keep V2.9 overall in progress, with the next safe phase as V2.9.4 read-only Admin viewer prototype planning/implementation under a new explicit approval boundary.
