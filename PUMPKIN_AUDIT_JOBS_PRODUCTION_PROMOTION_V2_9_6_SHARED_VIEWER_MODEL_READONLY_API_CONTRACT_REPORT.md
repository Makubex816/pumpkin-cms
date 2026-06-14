# Pumpkin Audit Jobs Production Promotion V2.9.6 Shared Viewer Model Read-Only API Contract Report

Status: complete for local/read-only shared contract foundation.

Created: 2026-06-13T22:20:00-04:00.

## Scope

V2.9.6 used the completed V2.9.5 Admin viewer navigation/source QA signoff to create a shared contract layer between the audit-job-ledger package, current Admin viewer, future Pumpkin API read-only endpoints, and future Electron viewer. This phase added local contracts, schemas, fixture-backed API examples, validator CLI support, tests, result package, root report, and control-doc updates.

No live API endpoint, Pumpkin API runtime endpoint, Electron runtime, deployment, redeployment, DNS/custom-domain mutation, Google/Search Console/indexing action, sitemap submission through Google, URL Inspection API, Google Indexing API, indexing request, crawl, outbound live check, contact-form submission, contact endpoint POST, CMS/provider write, Azure infrastructure/configuration mutation, RBAC assignment, protected config read, deployment/OAuth token print/export/listing/use, keys/listKeys, connection string, SAS, or `git add -A` occurred.

## Tracker Recommendation

Mark V2.9.6 complete. Keep V2 overall at `99%`. Move V2.9 to `94%`: planning, validator, viewer model, Admin prototype, navigation/source QA signoff, and shared read-only contract foundation are complete. Next recommended gate: V2.9.7 Admin Shared Contract Adapter and Local Runtime HTTP Remediation, still local/read-only.

## Current Lane

Current lane: V2.9 - Audit Jobs / Production Promotion Governance.

Layer refs: L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15.

## V2.9.5 Carryforward

V2.9.5 is committed as `529bbbf Implement V2.9.5 audit ledger admin navigation QA signoff`.

Carryforward:

- route `/dashboard/audit-jobs`;
- dashboard navigation entry;
- read-only Admin fixture provider;
- 12 panels;
- disabled future actions;
- filter/search/sort and read-only detail panel;
- V2.9.5 source QA and Admin type-check passed;
- runtime HTTP warning `local_next_dev_server_listened_but_timed_out` remains active.

## Shared Viewer Model Contract

Implemented in `deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-contract.mjs`.

Schema version: `audit-job-ledger-shared-viewer-model.v1`.

The contract wraps the existing viewer model and adds:

- `schemaVersion`;
- `providerMode`;
- `readOnly`;
- `redactionPolicy`;
- `generatedAt`;
- explicit no-write security boundary validation.

Required model fields include summary, panels, audit events, job runs, promotion gates, evidence bindings, trace IDs, warnings, blockers, next gates, security boundary, and redaction policy.

## Read-Only API Envelope Contract

Schema version: `audit-job-ledger-readonly-api-envelope.v1`.

Required envelope fields:

- `ok`;
- `requestId`;
- `correlationId`;
- `providerMode`;
- `readOnly`;
- `data`;
- `warnings`;
- `errors`;
- `securityBoundary`;
- `source`.

The envelope also includes Pumpkin API-style `status`, `code`, `message`, `tenantKey`, `siteKey`, and `meta` fields for future API alignment. In V2.9.6 these are contract fixtures only; no endpoint runtime was implemented.

## Future API Route Plan

Future GET-only route contracts:

- `GET /api/admin/audit-jobs/viewer-summary`;
- `GET /api/admin/audit-jobs/events`;
- `GET /api/admin/audit-jobs/job-runs`;
- `GET /api/admin/audit-jobs/promotion-gates`;
- `GET /api/admin/audit-jobs/evidence-bindings`;
- `GET /api/admin/audit-jobs/traces`.

Future implementation must require Admin authorization, tenant/site context, read-only provider mode, and no write methods.

## Admin Consumer Mapping

Admin can map its existing fixture-backed provider to the V2.9.6 envelope:

- provider mode -> `providerMode`;
- fixture path -> `source.fixturePath`;
- viewer model arrays -> `data.*`;
- safety banner state -> `securityBoundary`;
- disabled future actions -> contract validator mutation guard.

Admin adoption remains a future local/read-only V2.9.7 task.

## Electron Consumer Mapping

Electron remains future-gated. The planned consumer must read the same envelope, preserve redaction/security diagnostics, keep provider mode explicit, and reject enabled mutation actions or open security flags before rendering.

## Contract Validator Result

Implemented:

- `api-fixture` CLI command;
- `validate-contract` CLI command;
- shared viewer model validator;
- read-only API envelope validator;
- JSON schemas;
- generated combined fixture API envelope.

Validation coverage includes required fields, read-only flags, deferred indexing, no-write security boundary, redaction policy, enabled mutation actions, token-like field detection, count consistency, and runtime warning carryforward.

`npm test` passed 22 tests.

## Runtime HTTP Warning Carryforward

V2.9.5 runtime warning is preserved in:

- `source.runtimeHttpWarning`;
- `meta.runtimeHttpWarning`.

Value:

`local_next_dev_server_listened_but_timed_out`

This remains a local runtime availability issue for V2.9.7, not an API runtime implementation.

## Future Boundaries

Live API endpoint implementation, Pumpkin API endpoint implementation, Electron runtime implementation, provider writes, CMS writes, deployment, indexing, DNS/custom-domain mutation, contact-form POST, protected config reads, Azure mutation, RBAC, token/key/connection-string/SAS use remain future separately approved boundaries.

## Google Indexing Deferred

Google/Search Console/indexing remains deferred by hard stop. The contract validator requires `summary.indexingState: deferred`, the `indexing-deferred` panel, and the `google-indexing-deferred` next gate.

## Result Package

Result package:

`deployment/architecture/audit-jobs-production-promotion/v2-9-6-shared-viewer-model-readonly-api-contract-planning-result/`

The package contains all 23 required files, including shared viewer model contract, read-only API envelope contract, future API route plan, Admin/Electron mappings, fixture-backed examples, contract validator result, runtime warning carryforward, boundary summaries, validation summary, and next-phase prompt.

## Next Phase

Next prompt path:

`deployment/architecture/audit-jobs-production-promotion/v2-9-6-shared-viewer-model-readonly-api-contract-planning-result/next-phase-prompt.md`

Recommended next phase: V2.9.7 Admin Shared Contract Adapter and Local Runtime HTTP Remediation only.
