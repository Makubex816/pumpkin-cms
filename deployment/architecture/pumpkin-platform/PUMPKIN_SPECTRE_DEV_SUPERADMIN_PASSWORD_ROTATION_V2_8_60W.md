# Pumpkin Spectre Dev SuperAdmin Password Rotation V2.8.60W

Status: blocked before rotation.

V2.8.60W verified the approved secure file, verified the old V2.8.47 hardcopy SHA-256, proved current Spectre Dev SuperAdmin login, and implemented a minimal source route for SuperAdmin self password rotation.

The rotation did not occur because the single approved Pumpkin API deploy attempt failed before the route became live. The current password still logs in, and the new password was not submitted to the live API.

## Source Repair

Implemented source files:

- `apps/pumpkin-api/Services/UserProfileManagement.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs`

Route shape:

`POST /api/admin/users/{tenantId}/{userId}/password`

Boundary:

- JWT required.
- `SuperAdmin` role required.
- Route target must match authenticated actor tenant/user claims.
- Current password required.
- New password must be at least 12 characters and differ from current password.
- BCrypt verifies current password and hashes the new password.
- Response is sanitized and does not include password or password hash.

## Blocker

Azure Kudu/OneDeploy failed during parallel rsync with invalid argument errors on Windows-style paths under `/home/site/wwwroot`. The live route probe returned HTTP 404 after the failed deployment.

Retry requires a POSIX-safe deployment artifact and a new approval.
