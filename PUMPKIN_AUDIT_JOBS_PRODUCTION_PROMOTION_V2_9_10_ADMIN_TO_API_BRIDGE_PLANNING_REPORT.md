# Pumpkin Audit Jobs Production Promotion V2.9.10 Admin To API Bridge Planning Report

Status: complete for approved local/read-only bridge planning.

Created: 2026-06-14T00:58:00-04:00.

## Scope

V2.9.10 planned the future Admin-to-Pumpkin-API read-only bridge from the current Admin fixture provider mode `admin-local-fixture-readonly` to future `admin-api-readonly`.

No Admin bridge implementation occurred. No Admin provider behavior was replaced. No new API endpoint was implemented. No POST, PUT, PATCH, or DELETE Audit Jobs endpoint was implemented. No CMS/provider write, live provider integration, Electron runtime, deployment, redeployment, DNS/custom-domain mutation, Google/Search Console/indexing action, sitemap submission, URL Inspection API, Google Indexing API, indexing request, crawl, outbound live check, contact-form submission, contact endpoint POST, Azure infrastructure/configuration mutation, RBAC assignment, protected config read, deployment/OAuth token use/print/export/listing, keys/listKeys, connection material generation, SAS generation, or `git add -A` occurred.

## Tracker Recommendation

Mark V2.9.10 complete. Keep V2 overall at `99%`. Keep V2.9 at `99%`: the GET-only API foundation and Admin-to-API bridge plan are complete, while the actual Admin bridge implementation remains the next gated step.

Next recommended gate: V2.9.11 Admin-to-Pumpkin-API Read-Only Bridge Implementation.

## Current Lane

Current lane: V2.9 - Audit Jobs / Production Promotion Governance.

Layer refs: L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15.

## V2.9.9 Carryforward

V2.9.9 is committed as `4956865 Implement V2.9.9 audit ledger get-only API`.

Carryforward:

- 8 GET-only Pumpkin API endpoints under `/api/admin/audit-jobs`;
- read-only envelope provider mode `api-local-fixture-readonly`;
- source provider mode `local-fixture-readonly`;
- counts: events `11`, job runs `9`, gates `11`, evidence `13`, traces `107`, warnings `1`, blockers `0`, next gates `2`;
- no mutation routes.

## Admin-To-API Bridge Scope

V2.9.11 should add an Admin read-only API client, provider-mode switch, route orchestration, API envelope adapter support, fixture fallback, degraded states, tenant/site query handling, request/correlation metadata, parity tests, and runtime QA.

Fixture mode remains the default fallback. API mode should be explicit as `admin-api-readonly`.

## Endpoint-To-Panel Mapping

- `/viewer-summary`: Release Summary, panel counts, global state, warnings, blockers, next gates;
- `/events`: Audit Events and operational coverage panels;
- `/job-runs`: Job Runs;
- `/promotion-gates`: Promotion Gates and blockers context;
- `/evidence-bindings`: Evidence Bindings;
- `/traces`: Trace Explorer;
- `/blockers`: blockers area;
- `/next-gates`: next-gates area and disabled future-action context.

## Endpoint-To-Detail Mapping

Admin detail records should continue to normalize into existing record kinds:

- `audit_event` from `/events`;
- `job_run` from `/job-runs`;
- `promotion_gate` from `/promotion-gates`;
- `evidence_binding` from `/evidence-bindings`;
- `trace_id` from `/traces`.

## Provider-Mode Transition Plan

The future adapter should accept `api-local-fixture-readonly` envelopes only when Admin is running `admin-api-readonly`. Existing `admin-local-fixture-readonly` stays valid and remains fallback.

The bridge must surface provider mode, source provider mode, request ID, correlation ID, fallback state, and fallback reason.

## Admin API Client Contract Plan

The future client must call only the eight GET endpoints, require tenant/site scope, validate read-only envelopes, reject open write boundaries, preserve warnings/errors, and never log raw authorization material or secret-like values.

## Fallback/Error/Degraded State Plan

If API mode fails availability, auth, tenant/site, status, envelope, read-only, boundary, count, or future-action validation, Admin falls back to fixture mode and displays a degraded reason. If both API and fixture fail, Admin renders a read-only error state with no mutation controls.

## Query/Filter/Search/Sort Mapping

Admin search maps to the API `search` parameter where supported and remains locally applied to merged records. Admin kind maps to route family. Admin state maps to route-specific status/state/result filters where exact. Sorting remains local because V2.9.9 did not implement API sort parameters.

## Tenant/Site Query Behavior

Every API request must include `tenantKey` and `siteKey`. Future Admin implementation should derive scope from existing Admin context/session and allow local tests to inject the current fixture scope. Wrong or missing scope renders a read-only degraded state.

## Read-Only Safety And Disabled Actions

V2.9.11 must preserve the read-only banner, closed write boundary, `INDEXING_DEFERRED` warning, `google-indexing-deferred` next gate, and disabled future actions for indexing, redeploy, and contact check.

## API Runtime Verification Result

API build passed and the V2.9.9 scoped API runner passed.

Bounded localhost GET verification was attempted with synthetic local-only auth and no protected config. It was blocked because the current API runtime resolves `DatabaseService`/Cosmos connection setup during request processing without safe local DB configuration. Supplying a real connection configuration or reading protected config was not approved, so no further runtime probing was performed.

## Contract Parity Test Plan

V2.9.11 should add parity tests proving fixture and API modes produce the same Admin panels, counts, record kinds, read-only boundary, disabled actions, Google indexing deferred state, and secret-safe response behavior.

## Admin Runtime QA Plan

Future runtime QA should verify `/dashboard/audit-jobs` in fixture mode and API mode, with API-backed data loaded through mocked or safe local GET responses, fallback behavior visible, and all mutation actions disabled.

## Future Implementation Boundary

V2.9.11 may implement only the Admin read-only bridge. It must not change the Pumpkin API route family or add live provider integration.

## Google Indexing Deferred

Google/Search Console/indexing remains deferred by hard stop. V2.9.10 preserved the deferred state and planned only display carryforward, not execution.

## Security Boundary Confirmation

No protected config, token/key material, connection material, SAS, Azure mutation, RBAC, deployment, DNS, indexing, crawl, outbound live check, contact POST, provider write, CMS write, or Electron implementation occurred.

## Validation

Validation passed:

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj`;
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-9-9`;
- audit-ledger `npm run check`;
- audit-ledger `npm test` with `22` passing tests;
- audit-ledger combined `validate`;
- audit-ledger combined `viewer-summary`;
- audit-ledger read-only envelope `validate-contract`.

Final hygiene scans are recorded in the V2.9.10 package validation summary.

## Result Package

Result package:

`deployment/architecture/audit-jobs-production-promotion/v2-9-10-admin-to-pumpkin-api-readonly-bridge-planning-result/`

The package contains all 26 required files.

## Next Phase

Next prompt path:

`deployment/architecture/audit-jobs-production-promotion/v2-9-10-admin-to-pumpkin-api-readonly-bridge-planning-result/next-phase-prompt.md`

Recommended next phase: V2.9.11 Admin-to-Pumpkin-API Read-Only Bridge Implementation only.
