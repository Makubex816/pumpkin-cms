# Pumpkin Admin Auth Cleanup Phase 1.6 Report

## Summary

Phase 1.6 removes the normal-admin-flow `404` noise from missing auth endpoints by adding small JWT-backed endpoints to Pumpkin API:

- `GET /api/auth/verify`
- `POST /api/auth/logout`

The admin app already called these endpoints. The smallest clean fix was to implement them server-side instead of removing useful client behavior. No page editing, import/export, archive, delete, static export, `.env.local`, `appsettings.Development.json`, secrets, or production data were changed.

## Root Cause

The admin `AuthContext` was already designed to:

- call `apiClient.verifyToken()` when restoring a token from localStorage
- call `apiClient.logout()` before clearing local auth state

But `apps/pumpkin-api` only implemented:

- `POST /api/auth/login`

So normal admin reload/logout flows produced:

- `GET /api/auth/verify` -> `404`
- `POST /api/auth/logout` -> `404`

The failures were caught by the admin client, so page viewing still worked, but the runtime flow was noisy and less reliable before editor work.

## Files Changed

- `apps/pumpkin-api/Program.cs`
  - Added JWT-protected `GET /api/auth/verify`.
  - Added JWT-protected `POST /api/auth/logout`.

No admin source files were changed.

## Endpoint Behavior

### `GET /api/auth/verify`

Behavior:

- Requires a valid JWT.
- Returns `401` for missing, invalid, expired, incomplete, inactive, or stale user tokens.
- Reads the current user from Cosmos by the token email claim.
- Confirms user is active.
- Confirms token user id and tenant id match the current user record.
- Returns `UserInfo` with:
  - id
  - tenant id
  - email
  - username
  - first/last name
  - role
  - permissions

### `POST /api/auth/logout`

Behavior:

- Requires a valid JWT.
- Returns `200 OK` with a harmless acknowledgement.
- Does not revoke tokens server-side.
- The admin remains responsible for clearing localStorage state.

This matches the current stateless JWT design.

## Auth Flow After Cleanup

Admin flow now behaves as:

1. User logs in with `POST /api/auth/login`.
2. API returns JWT and `UserInfo`.
3. Admin stores JWT, user, and selected tenant in localStorage.
4. On reload, admin calls `GET /api/auth/verify`.
5. Verify returns current `UserInfo` and refreshes the stored user data.
6. Tenant selector loads tenants through JWT admin endpoints.
7. `/dashboard/pages` loads tenant pages.
8. Logout calls `POST /api/auth/logout`.
9. Admin clears JWT, user, and current tenant from localStorage.

## Runtime Verification

Direct API checks:

- Login returned a JWT.
- Verify returned `200 OK`.
- Verify returned current tenant, role, and permissions.
- Logout returned `200 OK`.
- Invalid token verify returned `401`.
- `GET /api/admin/pages?tenantId=ice-rink-rentals` still returned tenant pages.

Browser checks:

- Admin login succeeded.
- `/api/auth/verify` returned `200` during normal reload/restore flow.
- `/api/auth/logout` returned `200` during logout.
- No auth endpoint returned `404`.
- `/dashboard/pages` still loaded.
- Tenant selector still switched to `roller-rink-rentals`.
- Local auth state was cleared after logout.

## Checks Run

- `dotnet build apps/pumpkin-api/pumpkin-api.csproj --no-restore`
  - Passed.

- `npx eslint "src/app/dashboard/pages/page.tsx" "src/app/dashboard/pages/[id]/view/page.tsx" "src/lib/api.ts"` from `apps/admin`
  - Passed.

- Browser runtime verification using local Chrome and a temporary Playwright runtime
  - Passed for verify/logout/page-manager flow.

- `git diff --check`
  - Passed.

## Remaining Limitations

- Logout is stateless and does not revoke already-issued JWTs. This is acceptable for the current local/admin MVP, but server-side token revocation or short-lived access tokens plus refresh tokens may be needed later.
- Verify depends on the local `User` document existing and staying active.
- Full admin lint/type/build still has unrelated legacy blockers documented in earlier reports.
- This phase does not add editor permissions enforcement beyond existing JWT role/tenant checks.

## Next Recommended Phase

Next phase: structured page editor MVP.

Recommended next scope:

- Keep Phase 1 read-only manager as the safe baseline.
- Add structured edit mode for page metadata, SEO, content blocks, and image slot fields.
- Add validation and dirty-state protection before save.
- Keep import/export, delete/archive, and static export out of scope until the editor save/revision model is agreed.
