# Pumpkin Audit Jobs Production Promotion V2.9.9 GET-Only API Implementation Report

Status: complete for approved local/read-only Pumpkin API endpoint implementation.

Created: 2026-06-14T00:18:45-04:00.

## Scope

V2.9.9 implemented the scoped fixture-backed Pumpkin API read-only Audit Jobs endpoint foundation under `/api/admin/audit-jobs`.

No POST, PUT, PATCH, or DELETE Audit Jobs endpoint was implemented. No CMS/provider write, live provider integration, Electron runtime, deployment, redeployment, DNS/custom-domain mutation, Google/Search Console/indexing action, sitemap submission through Google, URL Inspection API, Google Indexing API, indexing request, crawl, outbound live check, contact-form submission, contact endpoint POST, Azure infrastructure/configuration mutation, RBAC assignment, protected config read, deployment/OAuth token use/print/export/listing, keys/listKeys, connection string generation, SAS generation, or `git add -A` occurred.

## Tracker Recommendation

Mark V2.9.9 complete. Keep V2 overall at `99%`. Move V2.9 to `99%`: the planning layer, validator, viewer model, Admin prototype, navigation/source QA, shared read-only contract foundation, Admin contract adapter, local runtime HTTP route proof, GET-only API preflight plan, and fixture-backed Pumpkin API GET-only endpoint foundation are complete.

Next recommended gate: V2.9.10 Admin-to-Pumpkin-API Read-Only Bridge Planning.

## Current Lane

Current lane: V2.9 - Audit Jobs / Production Promotion Governance.

Layer refs: L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15.

## V2.9.8 Carryforward

V2.9.8 is committed as `8f4e2d3 Plan V2.9.8 audit ledger get-only API preflight`.

Carryforward:

- 8-route GET-only `/api/admin/audit-jobs` matrix;
- DTO/read-model and read-only envelope plan;
- fixture-backed provider plan;
- tenant/site authorization plan;
- no-write route guard plan;
- error, trace, correlation, Admin compatibility, Electron boundary, and API test plans.

## GET-Only API Implementation Result

Implemented files:

- `apps/pumpkin-api/Services/AuditJobs/AuditJobApiContracts.cs`
- `apps/pumpkin-api/Services/AuditJobs/AuditJobReadOnlyProvider.cs`
- `apps/pumpkin-api/Services/AuditJobs/AuditJobReadOnlyService.cs`
- `apps/pumpkin-api/Services/AuditJobs/AuditJobAuthorizationService.cs`
- `apps/pumpkin-api/Services/AuditJobs/AuditJobReadOnlyEndpoints.cs`
- `apps/pumpkin-api.Tests/AuditJobApiReadOnlyTestRunner.cs`

Program wiring:

- `builder.Services.AddAuditJobReadOnlyFoundation();`
- `app.MapAuditJobReadOnlyEndpoints();`

## Route Matrix Result

Implemented routes:

- `GET /api/admin/audit-jobs/viewer-summary`
- `GET /api/admin/audit-jobs/events`
- `GET /api/admin/audit-jobs/job-runs`
- `GET /api/admin/audit-jobs/promotion-gates`
- `GET /api/admin/audit-jobs/evidence-bindings`
- `GET /api/admin/audit-jobs/traces`
- `GET /api/admin/audit-jobs/blockers`
- `GET /api/admin/audit-jobs/next-gates`

## DTO And Read-Model Result

Implemented DTO/read-model contracts include:

- `AuditJobViewerSummaryDto`
- `AuditEventDto`
- `JobRunDto`
- `PromotionGateDto`
- `EvidenceBindingDto`
- `TraceEntryDto`
- `AuditJobWarningDto`
- `AuditJobBlockerDto`
- `AuditJobNextGateDto`
- `ReadOnlyApiEnvelopeDto<T>`

List wrappers exist for every list route.

## Read-Only Envelope Result

Every success and error response includes `ok`, `status`, `code`, `message`, `requestId`, `correlationId`, `providerMode`, `readOnly`, `data`, `warnings`, `errors`, `securityBoundary`, `source`, `tenantKey`, `siteKey`, and `meta`.

Provider mode is `api-local-fixture-readonly`; source provider mode `local-fixture-readonly` is preserved in metadata.

## Fixture-Backed Provider Result

`FixtureAuditJobReadOnlyProvider` loads:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json`

The provider validates schema, read-only state, provider mode, tenant/site scope, and closed write-boundary flags before returning route data.

## Authorization And Tenant Isolation Result

Allowed roles:

- Viewer
- Operator
- TenantAdmin
- SuperAdmin
- BackupOperator

Errors:

- unauthenticated: `AUDIT_JOB_AUTH_REQUIRED`
- unsupported role: `AUDIT_JOB_FORBIDDEN_ROLE`
- wrong tenant: `AUDIT_JOB_FORBIDDEN_TENANT`
- wrong site when site claim exists: `AUDIT_JOB_FORBIDDEN_SITE`
- missing tenant/site query: `AUDIT_JOB_SCOPE_REQUIRED`

## No-Write API Guard Result

The Audit Jobs endpoint mapper contains exactly 8 `MapGet` registrations and no `MapPost`, `MapPut`, `MapPatch`, or `MapDelete` registrations.

The scoped test runner also scans `Program.cs` to confirm no Audit Jobs write mapper is registered.

## Error Envelope Result

Error envelopes remain read-only and use the same top-level shape as success envelopes. Missing fixture and invalid fixture states return redacted read-only errors without leaking protected config or secret material.

## Trace And Correlation Result

Responses generate route-level request IDs and preserve the fixture correlation ID `corr-combined-v2-8-production-promotion`.

The trace route returns 107 trace entries by default and supports field, audit event ID, correlation ID, and search filtering.

## API Test Result

Implemented runner:

`dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-9-9`

The runner covers:

- all 8 route service methods;
- read-only envelope and provider mode;
- counts: events `11`, job runs `9`, gates `11`, evidence `13`, traces `107`, warnings `1`, blockers `0`, next gates `2`;
- event, gate, and trace filters;
- authorization success/denial cases;
- endpoint handler JSON serialization;
- missing fixture read-only error;
- no mutation route registration;
- no high-confidence secret-like response values;
- deferred Google indexing visibility.

## Admin Compatibility

Admin still consumes the local V2.9.6 envelope through the V2.9.7 adapter. V2.9.9 does not switch Admin to the runtime API.

The next boundary should plan the Admin-to-Pumpkin-API read-only bridge.

## Electron Boundary

Electron remains future-gated and unimplemented.

## Google Indexing Deferred

Google/Search Console/indexing remains deferred by hard stop. V2.9.9 preserved the `INDEXING_DEFERRED` warning and `google-indexing-deferred` next gate; no indexing action occurred.

## Validation

Validation passed:

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj`
- `dotnet build apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj`
- `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-9-9`
- audit-ledger `npm run check`
- audit-ledger `npm test` with `22` passing tests
- audit-ledger `validate:combined`
- audit-ledger `viewer-summary:combined`
- audit-ledger `api-fixture:combined`
- audit-ledger `validate-contract:combined`

Final hygiene scans are recorded in the V2.9.9 package validation summary.

## Result Package

Result package:

`deployment/architecture/audit-jobs-production-promotion/v2-9-9-get-only-pumpkin-api-readonly-endpoint-implementation-result/`

The package contains all 24 required files.

## Next Phase

Next prompt path:

`deployment/architecture/audit-jobs-production-promotion/v2-9-9-get-only-pumpkin-api-readonly-endpoint-implementation-result/next-phase-prompt.md`

Recommended next phase: V2.9.10 Admin-to-Pumpkin-API Read-Only Bridge Planning only.
