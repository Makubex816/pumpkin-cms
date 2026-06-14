# Tenant Site Query Behavior

Required scope:

- `tenantKey`;
- `siteKey`.

Current fixture scope:

- tenant: `ice-rink-rentals`;
- site: `ice-rink-rentals`.

Future Admin behavior:

- derive tenant/site from Admin route/session/context when available;
- allow test injection for local fixture/API parity tests;
- send both values on every Audit Jobs API request;
- normalize values to lower-case trimmed keys;
- never infer cross-tenant access from client-side state alone;
- display scope mismatch errors as read-only degraded state;
- fallback to fixture mode only when the fixture scope matches the requested tenant/site.

Auth behavior:

- allowed read roles remain Viewer, Operator, TenantAdmin, SuperAdmin, and BackupOperator;
- `401` means session/auth unavailable;
- `403` means role, tenant, or site mismatch;
- Admin must not ask the user to paste a token into the UI.

