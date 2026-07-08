# Pumpkin Admin CMS AuthZ Boundary V2.8.61M

Status: SuperAdmin proof complete; TenantAdmin live proof remains a credential gap.

SuperAdmin boundary:

- SuperAdmin can authenticate and verify successfully.
- SuperAdmin can render source-discovered Admin UI read surfaces.
- SuperAdmin can use source-supported read-only Admin/CMS APIs for the Ice tenant.
- SuperAdmin can read platform-level tenant counts and sanitized user counts.

Source guard observations:

- `apps/admin/src/app/dashboard/layout.tsx` filters Onboarding, Backups, Packages, Domains, Users/Admins, and Tenants navigation to `SuperAdmin`.
- Direct route components for Users, Onboarding, Domains, Backups, Packages, and Tenants contain SuperAdmin checks and Access Restricted fallbacks.
- Pumpkin API routes enforce JWT authorization and role/tenant checks on tenant-scoped read routes.
- DomainBinding read routes require SuperAdmin authorization at endpoint level.

TenantAdmin boundary:

- TenantAdmin credentials were not available in V2.8.61M.
- V2.8.61M did not ask for TenantAdmin credentials.
- V2.8.61M did not claim live TenantAdmin denial proof.
- A future credentialed GET-only proof is required to close the live TenantAdmin boundary gap.

Mutation boundary:

- Auth login was the only approved POST.
- No tenant/content/media/user/role/DomainBinding mutation occurred.
- No contact POST, form submission, customer-facing POST, deploy, DNS, appsetting mutation, or indexing action occurred.
