# Auth Tenant Parity

Classification: `auth_model_compatible_tenant_profile_registry_needed`

External auth/tenant model:

- Public tenant content uses API-key Bearer auth.
- Admin routes use JWT.
- Login is `/api/auth/login`.
- Roles include SuperAdmin/TenantAdmin-style authorization.
- Tenant isolation uses `tenantId`.

Current build:

- Preserves `/api/auth/login`.
- Adds `/api/auth/verify` and `/api/auth/logout`.
- Keeps SuperAdmin/TenantAdmin checks.
- Adds ProviderMetadataService and more admin modules.

Compatibility risk:

Current tenant-specific runtime behavior is partly hard-coded for Ice/Roller rather than entirely tenant-profile driven. This blocks safe secondary creation until remediated or explicitly extended.
