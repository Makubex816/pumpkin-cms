# Pumpkin Tenant Website Publish Readiness V2.8.60W SuperAdmin Password Rotation Report

Phase status: blocked before password rotation.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: spectre_dev_superadmin_custom_password_rotation_secure_hardcopy_no_domain_no_contact_form_post.

## V2.8.60V Carryforward

V2.8.60V responsive onboarding guardrails remain in place. The Airstrip `/airstrip-the-club` mobile overflow blocker remains a future pre-domain-cutover blocker. Domain/custom-domain cutover remains on hold.

## Password Route Discovery and Repair

Source discovery found no existing password change/reset route. Source confirmed:

- Login route is `POST /api/auth/login`.
- Login verifies password with BCrypt against `User.PasswordHash`.
- Role model is `UserRole` with `SuperAdmin`, `TenantAdmin`, `Editor`, and `Viewer`.
- Sanitized user responses do not return password or password hash.
- User update support exists through `UpdateUserAsync`.

Implemented in source:

- SuperAdmin-only self password route: `POST /api/admin/users/{tenantId}/{userId}/password`.
- Current password verified with BCrypt.
- New password hashed with BCrypt.
- Route is self-targeting and does not expose password/hash values.

## Test and Build

Focused test passed:

`dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-8-58c-user-profile`

Pumpkin API Release build passed with 0 warnings and 0 errors.

## Deploy Result

One approved Pumpkin API deploy attempt was made.

Result: failed.

Azure deployment id: `0d230f3b-019f-4f41-8d9c-04434a9c34fd`.

Public-safe failure summary: Kudu/OneDeploy parallel rsync failed with invalid argument errors on Windows-style paths under `/home/site/wwwroot`.

Live route probe after failure: HTTP 404, route not live.

Hard stop applied: stopped before password rotation.

## Rotation Result

Password rotation did not occur.

- Pre-rotation current password login: succeeded.
- Current password login after deploy failure: succeeded.
- New password was not submitted to live API.
- Old password rejection proof: not run because rotation did not occur.
- New password login proof: not run because rotation did not occur.
- SuperAdmin role pre/post-failure current-login proof: `SuperAdmin`.

## TenantAdmin Proof

No TenantAdmin password change occurred. The implemented route is self-targeting and SuperAdmin-only, and no live rotation happened.

Airstrip TenantAdmin live login proof was blocked because the approved V2.8.60W secure file does not include an Airstrip TenantAdmin password, and older hardcopy contents were not approved to be read.

## Hardcopy Result

Old V2.8.47 hardcopy was preserved unchanged.

Old hardcopy path:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-47-superadmin-themes-forms\SUPERADMIN_THEMES_FORMS_OPERATOR_HARD_COPY.txt`

Old hardcopy SHA-256:

`9668d227b516bdb6811b1cfca77f4017bb5f6117f742c38176b51706d8147256`

New V2.8.60W hardcopy was not created because rotation did not succeed.

## No-Domain and No-POST Boundary

Confirmed no custom-domain cutover, Bluehost DNS mutation, Azure hostname binding, nameserver change, Google Workspace email DNS activation, CDN/Front Door, indexing, contact POST, form submission, customer-facing POST proof, media upload/delete, Airstrip/Ice content mutation, TenantAdmin password change, role change, tenant reassignment, storage key/listKeys, SAS generation, connection string generation, or Key Vault secret query occurred.

## Runtime No-Regression

Runtime GET no-regression passed after the failed deploy attempt:

- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Ice apex/www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200.
- Airstrip production default `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

## Files Created or Modified

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60W_SUPERADMIN_PASSWORD_ROTATION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-60w-superadmin-password-rotation-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60W.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60W.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60W.md`

Modified:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/UserProfileManagement.cs`
- `apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs`

## Validation

Validation results are recorded in:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60w-superadmin-password-rotation-result/validation-summary.md`

## Next Approval

Next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60w-superadmin-password-rotation-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60W_SUPERADMIN_PASSWORD_ROTATION_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-60w-superadmin-password-rotation-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60W.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60W.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60W.md" `
  "apps/pumpkin-api/Program.cs" `
  "apps/pumpkin-api/Services/UserProfileManagement.cs" `
  "apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs"

git diff --cached --check
git commit -m "Add SuperAdmin password rotation route and V2.8.60W closeout"
```
