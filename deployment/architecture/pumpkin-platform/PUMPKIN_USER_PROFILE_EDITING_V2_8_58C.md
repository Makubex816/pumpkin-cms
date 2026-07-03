# Pumpkin User Profile Editing V2.8.58C

Status: implemented and deployed.

API routes:

- `GET /api/admin/users`
- `PATCH /api/admin/users/{tenantId}/{userId}`

Allowed update fields:

- `email`
- `firstName`
- `lastName`

Disallowed update fields:

- `role`
- `tenantId`
- `password`
- `passwordHash`
- `apiKey`
- `token`
- `isActive`

Admin UI route:

- `/dashboard/users`

Proof:

- Source tests passed.
- SuperAdmin live list/update proof passed.
- Airstrip TenantAdmin display name was updated and restored.
- Live email mutation was not performed.

