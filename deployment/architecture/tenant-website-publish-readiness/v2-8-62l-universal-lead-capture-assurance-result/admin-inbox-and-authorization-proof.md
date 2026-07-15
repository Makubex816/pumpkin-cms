# Admin Inbox and Authorization Proof

The Admin inbox now exposes readiness, pagination, status/form/page/source-host/date/search filtering, safe export, detail metadata, stable IDs, consent, spam, persistence, and notification state. API filtering and pagination are tenant-authorized and bounded.

Party TenantAdmin listed/opened its proof and received 403 for Ice/Vegas. Airstrip TenantAdmin listed its own empty inbox/readiness and received 403 for Party/Vegas. SuperAdmin searches by ID/submission/correlation returned one explicitly selected-tenant result; cross-tenant entry-ID controls returned 404. Unauthenticated access returned 401. Existing committed Ice and Vegas TenantAdmin evidence remains valid under the unchanged membership boundary.
