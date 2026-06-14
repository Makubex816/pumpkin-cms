# Pumpkin Audit Jobs Production Promotion V2.9.8 GET-Only API Preflight Report

Status: complete for approved local/read-only Pumpkin API endpoint preflight planning.

Created: 2026-06-13T23:34:00-04:00.

## Scope

V2.9.8 used the completed V2.9.7 Admin shared contract adapter and runtime HTTP remediation result to create an implementation-ready, planning-only contract packet for future Audit Jobs / Production Promotion GET-only Pumpkin API endpoints.

No Pumpkin API runtime endpoint, API controller, minimal API endpoint registration, runtime API service/provider, live API serving, Electron runtime, deployment, redeployment, DNS/custom-domain mutation, Google/Search Console/indexing action, sitemap submission through Google, URL Inspection API, Google Indexing API, indexing request, crawl, outbound live check, contact-form submission, contact endpoint POST, CMS/provider write, Azure infrastructure/configuration mutation, RBAC assignment, protected config read, deployment/OAuth token use/print/export/listing, keys/listKeys, connection string generation, SAS generation, or `git add -A` occurred.

## Tracker Recommendation

Mark V2.9.8 complete. Keep V2 overall at `99%`. Move V2.9 to `98%`: planning, validator, viewer model, Admin prototype, navigation/source QA, shared read-only contract foundation, Admin contract adapter, local runtime HTTP route proof, and GET-only API endpoint preflight contract planning are complete.

Next recommended gate: V2.9.9 GET-Only Pumpkin API Read-Only Endpoint Implementation, fixture-backed and GET-only unless a future approval says otherwise.

## Current Lane

Current lane: V2.9 - Audit Jobs / Production Promotion Governance.

Layer refs: L01, L02, L03, L04, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15.

## V2.9.7 Carryforward

V2.9.7 is committed as `b1e7413 Implement V2.9.7 audit ledger admin contract adapter`.

Carryforward:

- Admin shared contract adapter;
- V2.9.6 read-only API envelope fixture consumption in Admin;
- Admin provider mode `admin-local-fixture-readonly`;
- local route HTTP 200 proof for `/dashboard/audit-jobs`;
- Admin type-check and V2.9.7 QA passed;
- audit-ledger checks passed.

## GET-Only Endpoint Scope

Future API base path:

`/api/admin/audit-jobs`

Allowed method:

`GET` only.

All future endpoint responses must preserve the V2.9.6 read-only API envelope semantics, explicit provider mode, request/correlation IDs, tenant/site scope, read-only security boundary, warnings/errors, and redaction/no-secret behavior.

## Future Route Matrix

Planned routes:

- `GET /api/admin/audit-jobs/viewer-summary`
- `GET /api/admin/audit-jobs/events`
- `GET /api/admin/audit-jobs/job-runs`
- `GET /api/admin/audit-jobs/promotion-gates`
- `GET /api/admin/audit-jobs/evidence-bindings`
- `GET /api/admin/audit-jobs/traces`
- `GET /api/admin/audit-jobs/blockers`
- `GET /api/admin/audit-jobs/next-gates`

No route was registered in V2.9.8.

## DTO And Read-Model Plan

Planned DTOs:

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

The future read model should derive route responses from the shared viewer model rather than rebuilding ledger logic independently.

## Response Envelope Mapping

Future response envelopes must include:

- `ok`;
- `status`;
- `code`;
- `message`;
- `requestId`;
- `correlationId`;
- `providerMode`;
- `readOnly`;
- `data`;
- `warnings`;
- `errors`;
- `securityBoundary`;
- `source`;
- `tenantKey`;
- `siteKey`;
- `meta`.

Success code should be `AUDIT_JOB_OK`. Error envelopes must remain read-only and redacted.

## Authorization And Tenant Isolation

Planned roles:

- Viewer;
- Operator;
- TenantAdmin;
- SuperAdmin;
- BackupOperator.

Every request must require authentication, allowed role, `tenantKey`, and `siteKey`. Tenant/site mismatches must return a read-only error envelope.

## No-Write API Guard Plan

Future implementation must scan route registration and fail if any POST, PUT, PATCH, DELETE, write provider, CMS write, deployment, indexing, contact-form, Azure mutation, protected config, token, key, connection material, SAS, crawl, or outbound live URL path is introduced under the Audit Jobs API route family.

## API Test Plan

Future tests should cover:

- contracts compile;
- only GET routes registered;
- fixture provider validates the V2.9.6 envelope;
- service routes return correct counts;
- auth denies unauthenticated, wrong role, wrong tenant, and wrong site;
- all success and error envelopes remain read-only;
- trace route is bounded;
- Google indexing remains deferred;
- no write methods are reachable.

## Future Boundaries

V2.9.8 did not implement API runtime behavior. V2.9.9 is the next boundary for fixture-backed GET-only implementation.

Electron remains future-gated and unimplemented.

## Google Indexing Deferred

Google/Search Console/indexing remains deferred by hard stop. No Search Console, sitemap submission through Google, URL Inspection API, Google Indexing API, indexing request, crawl, or outbound live URL check occurred.

## Result Package

Result package:

`deployment/architecture/audit-jobs-production-promotion/v2-9-8-get-only-pumpkin-api-readonly-endpoint-preflight-planning-result/`

The package contains all 25 required files, including route matrix, DTO/read-model plan, envelope mapping, service boundary plan, fixture provider plan, authorization matrix, no-write guard plan, trace/error/test plans, compatibility plans, validation summary, and next prompt.

## Validation

Closeout validation passed:

- result manifest parsed; reference `V2.9.8`, status `complete`;
- package file count matched manifest; `25` expected and `25` present;
- audit-ledger `npm run check` passed;
- audit-ledger `npm test` passed with `22` passing tests;
- audit-ledger `validate:combined`, `viewer-summary:combined`, `api-fixture:combined`, and `validate-contract:combined` passed;
- combined fixture counts remain audit events `11`, job runs `9`, promotion gates `11`, evidence bindings `13`, trace entries `107`, warnings `1`, blockers `0`, next gates `2`;
- API fixture contract remains schema `audit-job-ledger-readonly-api-envelope.v1`, provider `local-fixture-readonly`, readOnly `true`, panels `12`;
- trailing-whitespace, high-confidence secret-like, protected/generated/raw path, temp-like file, `git diff --check`, and staged-file checks passed.

Admin type-check/QA and Pumpkin API build/test were not run because V2.9.8 did not touch Admin source files or Pumpkin API source/test files.

## Next Phase

Next prompt path:

`deployment/architecture/audit-jobs-production-promotion/v2-9-8-get-only-pumpkin-api-readonly-endpoint-preflight-planning-result/next-phase-prompt.md`

Recommended next phase: V2.9.9 GET-Only Pumpkin API Read-Only Endpoint Implementation only.
