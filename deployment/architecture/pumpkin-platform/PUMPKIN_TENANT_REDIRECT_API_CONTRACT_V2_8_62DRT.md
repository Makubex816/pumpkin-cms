# Pumpkin Tenant Redirect API Contract V2.8.62DRT

## Purpose

Pumpkin uses a dedicated tenant-scoped redirect registry when a source route must return an HTTP redirect to a distinct target. This registry is generic and must not contain tenant-specific code paths.

## Record Contract

Every `TenantRedirect` records:

- immutable ID and tenant ID;
- immutable canonical source path;
- canonical target and explicit `internal` or `external` kind;
- one of `301`, `302`, `307`, or `308`;
- active state and query-preservation policy;
- `resolved` or `pending` target state;
- `redirect_before_page` precedence;
- explicit page-shadow mode plus shadowed page ID/slug where applicable;
- source package path/declaration;
- import and audit correlations;
- create/update/delete timestamps and actors;
- append-only audit events inside the record.

Unresolved pending targets must remain inactive. Source-path changes require deactivate plus create.

## Admin Routes

| Method | Route |
| --- | --- |
| GET | `/api/admin/tenants/{tenantId}/redirects` |
| POST | `/api/admin/tenants/{tenantId}/redirects` |
| PUT | `/api/admin/tenants/{tenantId}/redirects/{redirectId}` |
| DELETE | `/api/admin/tenants/{tenantId}/redirects/{redirectId}` |
| POST | `/api/admin/tenants/{tenantId}/redirects/validate` |

All Admin routes require JWT authentication. SuperAdmin may access every tenant. TenantAdmin may access only its own tenant. Other and cross-tenant access is denied.

`validate` is strictly non-mutating. It returns normalized values, target resolution, page conflicts/shadow state, warnings, errors, and cycles.

Create is idempotent for an exact active semantic replay. A conflicting active source returns conflict. Delete is soft deactivation.

## Runtime Route

`GET /api/redirects/{tenantId}/resolve?sourcePath=...&query=...`

The route requires the tenant API key as a bearer value. It returns only matched state, location, status code, and query-preservation state. It must not expose Admin audit or import metadata.

## Storage And Backup

Cosmos uses a dedicated `/tenantId` partition and source/active unique key. Mongo uses a compound tenant/source/active unique index. All queries include tenant scope.

Backup/export uses schema `1.0.0`, kind `pumpkin.tenant-redirects`. Restore must validate tenant scope, canonical values, uniqueness, status, pending safety, precedence, self-loops, and cycles before any write.

## DRT Activation Note

The routes deployed in DRT, but the first live build has a Linux internal-path classification defect. Corrected source is local and not live. A future approved deployment must prove internal validation before any tenant redirect mutation.
