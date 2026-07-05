# Password Route Repair Result

Status: implemented in source, not live.

Changed source:

- `apps/pumpkin-api/Services/UserProfileManagement.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs`

Repair shape:

- Added `ChangeUserPasswordRequest`.
- Added source service method that verifies current password with BCrypt and writes a new BCrypt password hash.
- Added `POST /api/admin/users/{tenantId}/{userId}/password`.
- Route requires JWT authentication.
- Route requires `SuperAdmin`.
- Route is self-targeting: route tenant/user must match authenticated actor claims.
- Route returns only the sanitized user profile shape.
- Route does not return password or password hash.

Live state:

- Deploy failed.
- Route probe returned HTTP 404.
- Route is not live.
