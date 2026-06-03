# Auth Code Path Review

Reviewed source files only:

- `apps/admin/src/contexts/AuthContext.tsx`
- `apps/admin/src/app/login/page.tsx`
- `apps/admin/src/lib/api.ts`
- `apps/pumpkin-api/Program.cs`
- `packages/pumpkin-ts-models/src/models/User.ts`

Findings:

- Admin login calls `POST /api/auth/login`.
- Login response shape is `token`, `user`, and `expiresAt`.
- The admin frontend stores the raw JWT in `localStorage` key `pumpkin_auth_token`.
- The admin frontend stores user JSON in `pumpkin_user`.
- The admin frontend stores current tenant JSON in `pumpkin_current_tenant`.
- Admin API client sends `Authorization: Bearer ${token}`.
- API exposes safe identity endpoint `GET /api/auth/verify`.
- API validates issuer, audience, lifetime, and signing key.
- JWT claims include name identifier, email, username, role, and `tenantId`.
- Admin page endpoints require an authenticated JWT and either matching `tenantId` or `SuperAdmin`.

Protected config was not read, so the actual local issuer, audience, and signing key values are intentionally not reported here.

