# Next Phase Prompt

Approve V2.9.11 Admin-to-Pumpkin-API Read-Only Bridge Implementation only.

Implement the Admin Audit Jobs read-only bridge from the existing `admin-local-fixture-readonly` provider to a future `admin-api-readonly` provider mode using the V2.9.9 GET-only Pumpkin API endpoints under `/api/admin/audit-jobs`. Add an Admin read-only API client, provider-mode switch, API envelope adapter support for `api-local-fixture-readonly`, route orchestration for the eight GET endpoints, fixture fallback, loading/error/degraded states, tenant/site query handling, requestId/correlationId display, disabled future-action carryforward, no-write UI guards, contract parity tests, and Admin runtime QA. Keep fixture mode as the default fallback unless explicitly switched by the implementation test boundary.

Approved for V2.9.11 only:

- modify Admin Audit Jobs source needed for read-only API bridge;
- modify Admin Audit Jobs tests/scripts for API-mode parity and QA;
- use existing V2.9.9 API routes without changing them;
- run local builds/tests and safe mocked or local-only GET checks when no protected config is required.

Not approved:

- new Pumpkin API routes;
- POST/PUT/PATCH/DELETE Audit Jobs endpoints;
- CMS/provider writes;
- live provider integration;
- Electron runtime;
- deployment/redeployment;
- DNS/custom-domain mutation;
- Google/Search Console/indexing;
- sitemap submission;
- URL Inspection API;
- Google Indexing API;
- crawling/outbound live checks;
- contact-form submission or POST;
- Azure mutation or RBAC assignment;
- protected config reads;
- deployment/OAuth token use, print, export, or listing;
- keys/listKeys;
- connection material generation;
- SAS generation;
- `git add -A`.

Acceptance:

- Admin can render Audit Jobs from fixture mode and API mode;
- API mode can fall back to fixture mode with visible degraded reason;
- provider mode, request ID, and correlation ID are visible in contract metadata;
- panel counts and records match V2.9.9;
- all future actions remain disabled;
- no write routes or mutation clients are introduced;
- Google/Search Console/indexing remains deferred.

