# Service And Read-Model Boundary Plan

Status: planned only.

Future API service names:

- `IAuditJobReadOnlyProvider`
- `FixtureAuditJobReadOnlyProvider`
- `IAuditJobReadOnlyService`
- `AuditJobReadOnlyService`
- `AuditJobAuthorizationService`
- `AuditJobReadOnlyEndpoints`

Boundary:

- endpoint handlers should only authorize, normalize query parameters, call the service, and return the envelope;
- service should only read from `IAuditJobReadOnlyProvider`, apply filters/sort/pagination, and map DTOs;
- provider should only return a shared viewer model or read-only envelope source;
- no provider write interface should be referenced by the read-only endpoint path;
- no database write abstraction should be injected into the read-only service;
- no CMS write, deployment, indexing, contact-form, provider-write, or Azure mutation service should be reachable.

Fixture-first implementation path for V2.9.9:

1. Add contracts and read-only service/provider classes under a dedicated Audit Jobs API folder.
2. Register only GET routes under `/api/admin/audit-jobs`.
3. Use the V2.9.6 fixture shape as the first provider source.
4. Run service tests against the fixture provider.
5. Run route/source scans proving no write methods are registered.

Runtime provider-backed implementation remains a later boundary after fixture-backed GET behavior passes.

