# Test Build Deploy Result

Status: tests/build passed; deploy failed.

Focused test:

`dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-58c-user-profile`

Result: passed.

Covered:

- SuperAdmin role accepted and TenantAdmin rejected for SuperAdmin-only checks.
- Existing sanitized user profile response omits password/hash/token.
- Existing profile update preserves password hash, role, tenant, and active state.
- New password rotation succeeds with current password.
- New password verifies with BCrypt.
- Old password is rejected by the new hash.
- Wrong current password is rejected.
- Password rotation response omits password and password hash.
- Program source registers the route.
- Program source enforces SuperAdmin role.
- Program source enforces self-targeting.

Build:

`dotnet build apps/pumpkin-api/pumpkin-api.csproj --configuration Release`

Result: passed, 0 warnings, 0 errors.

Publish:

`dotnet publish apps/pumpkin-api/pumpkin-api.csproj --configuration Release --output .tmp/v2-8-60w/publish/pumpkin-api`

Result: passed.

Deploy:

- Target: `app-pumpkin-api-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Deploy attempts: 1.
- Result: failed.
- Azure deployment id: `0d230f3b-019f-4f41-8d9c-04434a9c34fd`.
- Kudu/OneDeploy classification: parallel rsync failed with invalid argument on Windows-style path entries under `/home/site/wwwroot`.

Hard stop applied: stopped before password rotation.
