# Developer Endpoint Contract Review

Source: embedded operator-provided `API_ENDPOINTS.md` contract in the V2.8.36 prompt. A repo-local `API_ENDPOINTS.md` was not found.

Source mapping result:

- Public pages routes exist in `apps/pumpkin-api/Program.cs` as `/api/pages/{tenantId}/{**pageSlug}`, `/api/pages/{tenantId}`, and update/delete variants.
- Public sitemap route exists as `/api/tenant/{tenantId}/sitemap`.
- Auth route exists as `/api/auth/login` with `{ email, password }` shape.
- Admin tenant and Admin page routes exist and enforce JWT authentication.
- Content hierarchy routes exist as `/api/admin/tenants/{tenantId}/hubs`, `/hubs/{hubPageSlug}/spokes`, and `/content-hierarchy`.
- Media, publish-run, import-run, and FormEntry Admin routes exist as tenant-scoped routes.

Contract mismatches or notes:

- FormEntry Admin routes in source use `/api/admin/{tenantId}/form-entries`, while the embedded no-regression contract referenced `/api/admin/forms/{tenantId}/entries`. V2.8.36 did not alter FormEntry behavior.
- Theme routes exist in source but are explicitly excluded from V2.8.36.
- Form Definition routes are excluded from V2.8.36.
