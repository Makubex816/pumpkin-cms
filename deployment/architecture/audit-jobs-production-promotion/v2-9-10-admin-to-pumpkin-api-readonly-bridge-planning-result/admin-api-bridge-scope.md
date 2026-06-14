# Admin API Bridge Scope

V2.9.11 should implement only the Admin-to-Pumpkin-API read-only bridge.

Implementation scope:

- add an Admin-side read-only API client for `/api/admin/audit-jobs/*`;
- keep the existing fixture provider as the default fallback;
- add provider mode `admin-api-readonly`;
- extend the Admin contract adapter to accept API envelope provider mode `api-local-fixture-readonly`;
- normalize API route fragments back into the existing `AuditJobLedgerViewerModel`;
- surface API `requestId`, `correlationId`, provider mode, and fallback state in Admin contract metadata;
- preserve current panels, filters, sorting, detail panel behavior, disabled future actions, and read-only safety banner.

Out of scope:

- replacing fixture mode as the only provider;
- changing or adding Pumpkin API routes;
- implementing mutation controls;
- enabling indexing, deployment, contact POST, provider writes, CMS writes, Azure mutation, or Electron runtime.

The future bridge should be reversible through provider-mode selection. If API mode fails contract validation or availability checks, Admin should return to fixture mode and display the degraded/fallback state.

