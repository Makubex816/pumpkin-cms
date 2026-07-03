# V2.8.58A TenantAdmin Route Repair and Airstrip Creation Report

## Phase Status

Status: blocked after route repair and Pumpkin API deploy.

Classification: `airstrip_media_upload_rbac_failed_after_tenantadmin_route_repair`.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

The missing TenantAdmin creation route was implemented, tested, built, and deployed to the production Pumpkin API. Controlled Airstrip creation resumed until the required Azure Blob media upload step. The Airstrip-only media container was created with Blob public access, but all blob upload/readback proof failed under RBAC/auth-mode login. The container was deleted successfully as Airstrip-only rollback. No Airstrip tenant or tenant data records were created.

## V2.8.58 Carryforward

- V2.8.58 blocker: `tenantadmin_creation_route_missing_before_mutation`.
- V2.8.58 had no live mutation.
- V2.8.57A visual approval remains carried forward for Airstrip homepage preview.
- Retained secure file remained ignored at `.tmp/v2-8-58/secure/airstrip-controlled-creation.json`.

## Route Repair Result

Implemented source-supported route:

- `POST /api/admin/tenants/{tenantId}/tenant-admins`
- SuperAdmin-only.
- Creates active `TenantAdmin` users for an existing tenant.
- Uses existing `User` model, `UserRole.TenantAdmin`, `User` container/collection, `tenantId` partition key, and BCrypt password hashing.
- Validates tenant existence.
- Rejects duplicate email with conflict behavior.
- Does not return password or password hash.

Focused source tests passed for SuperAdmin role gate, non-SuperAdmin rejection helper, password hash non-disclosure, BCrypt verification, tenant partition safety, missing tenant rejection, and duplicate email conflict.

## Deploy Result

Pumpkin API was deployed exactly once.

- Deployment ID: `b74e7431-d13c-4313-9781-a72ee76e16c0`.
- Status: `RuntimeSuccessful`.
- ZIP entries: 56.
- Backslash entries: 0.
- Appsettings entries: 0.

Post-deploy proof:

- Pumpkin API `/health`: HTTP 200.
- Pumpkin API `/api/health`: HTTP 200.
- SuperAdmin login: HTTP 200.
- Auth verify: HTTP 200.
- Route readiness probe against absent Airstrip tenant: HTTP 404, expected no-mutation result.
- Airstrip tenant remained absent after readiness probe.

## Airstrip Resume Result

Completed before media upload:

- Secure file exists and is ignored.
- Normalized Airstrip package validation passed: valid true, errors 0, warnings 0.
- 13 media assets resolved from the original partner ZIP.
- Source media byte size, SHA-256, content type, target blob path, and final public URL were computed.

Blocked at media upload:

- Container `airstrip-club-las-vegas-media` was created with public access `blob`.
- Upload attempt used Azure RBAC/auth-mode login only.
- Blob upload/readback proof failed with data-plane RBAC permission errors.
- Public URL readback returned HTTP 404 for all 13 expected blobs.
- No storage keys, listKeys, SAS, or connection strings were used.

Rollback:

- Airstrip media container delete succeeded.
- Follow-up exists check returned false.

## Tenant/Data Result

Not executed because required media upload failed before tenant creation:

- No Airstrip tenant created.
- No Airstrip TenantAdmin created.
- No tenant API key/static contact key binding sent.
- No pages imported.
- No theme created.
- No FormDefinition created.
- No MediaAsset records created.

## Runtime No-Regression

GET-only no-regression passed 14/14 checks:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Isolated Ice `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.

## Security Boundary

No Admin UI deploy, SWA deploy, production cutover, contact POST, form submission, DNS/custom-domain mutation, indexing, storage key/listKeys, SAS, connection string generation, Key Vault query, or Ice record mutation occurred.

No secret values or bearer tokens were printed or written to repo reports.

The secure file was retained because the phase is blocked after live mutation and a retry may need the approved values.

