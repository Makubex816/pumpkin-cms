# Pumpkin Admin Authorization Boundary V2.8.58C

Status: implemented and proved.

Roles:

- `SuperAdmin`
- `TenantAdmin`
- `Editor`
- `Viewer`

SuperAdmin-only surfaces:

- `/dashboard/onboarding`
- `/dashboard/users`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{tenantId}/{userId}`

Proof:

- SuperAdmin browser proof: onboarding and user management visible and accessible.
- TenantAdmin browser proof: onboarding and user management navigation hidden.
- TenantAdmin direct onboarding route: denied.
- TenantAdmin user-management API route: HTTP 403.

Non-approved operations remain unavailable in this phase: role change, tenant reassignment, password reset, account disable/delete, and user delete.

