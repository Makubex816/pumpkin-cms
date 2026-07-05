# Pumpkin Tenant Website Publish Readiness V2.8.60WA SuperAdmin Password Rotation Retry Report

Date: 2026-07-05

## Phase Status

Status: blocked_after_deploy_route_live_rotation_rejected_by_password_policy

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: superadmin_password_route_deploy_retry_rotation_closeout

The V2.8.60WA deploy retry succeeded and the SuperAdmin-only password route is live. The actual Spectre Dev SuperAdmin password rotation did not complete because the approved new password from the secure handoff was rejected by the live source password policy. No additional rotation attempt was made.

## V2.8.60W Carryforward

- V2.8.60W source route repair was already present before this retry.
- Route: `POST /api/admin/users/{tenantId}/{userId}/password`.
- Scope: SuperAdmin-only, self-targeting, current-password verification, BCrypt new-password hashing, sanitized response.
- V2.8.60W deploy had failed at Kudu/OneDeploy packaging with a Windows path rsync error.
- Failed V2.8.60W deployment id: `0d230f3b-019f-4f41-8d9c-04434a9c34fd`.

## Secure File Readiness

- Approved secure file was read only from `.tmp/v2-8-60w/secure/spectre-dev-password-rotation.json`.
- The secure file is git-ignored by `.gitignore` through `.tmp/`.
- Old hardcopy SHA-256 matched the expected value.
- Secret values were not printed or written into repo reports.
- Because rotation is blocked, `.tmp/v2-8-60w/secure/` was retained for retry.

## Deploy Retry Result

- Azure subscription was verified before deployment.
- Active subscription id: `ff887def-fd83-4a19-9298-13d4b1687873`.
- Target Web App: `app-pumpkin-api-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Exactly one POSIX ZIP deploy retry was performed.
- Deployment result: succeeded.
- Deployment id: `81fe72d5-eb79-430f-aa73-511f487eb422`.
- Package validation: no backslash ZIP entries and no protected config entries.

## Live Route Readiness

- Pumpkin API `/health`: HTTP 200.
- Pumpkin API `/api/health`: HTTP 200.
- Unauthenticated route probe no longer returned 404; it returned auth handling.
- Authenticated empty-body route readiness returned HTTP 400 validation behavior, proving the deployed route is active.

## Rotation Result

- Pre-rotation current Spectre Dev SuperAdmin credential login succeeded.
- Pre-rotation proposed new credential login was rejected.
- Rotation request reached the live route but returned HTTP 400 because the new password did not satisfy the source minimum-length policy.
- Current credential still logs in after the rejected rotation.
- Proposed new credential still does not log in.
- No new hardcopy was created because the password was not rotated.

## Role Preservation

- SuperAdmin authenticated API checks succeeded after the rejected rotation:
  - `GET /api/admin/tenants`: HTTP 200.
  - `GET /api/admin/users`: HTTP 200.
  - `GET /api/admin/domain-bindings`: HTTP 200.
- Admin UI protected route checks succeeded:
  - `/dashboard/onboarding`: HTTP 200.
  - `/dashboard/onboarding/domains`: HTTP 200.
- TenantAdmin credentials were not changed.

## Runtime No-Regression

All GET-only no-regression checks passed after the deploy retry and rejected rotation:

- Pumpkin API `/health`: HTTP 200.
- Pumpkin API `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Ice apex `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200.
- Ice www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200.
- Airstrip production default `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

Result: 17/17 GET checks returned HTTP 200.

## Security Boundary

- No DNS or domain mutation occurred.
- No contact POST occurred.
- No form submission occurred.
- No media upload occurred.
- No content write occurred.
- No storage mutation occurred.
- No Key Vault secret query occurred.
- No key/listKeys/SAS/connection string generation occurred.
- No search indexing occurred.
- No protected config file was read except the approved secure file.
- No secret value was printed or written to repo files.
- No files were staged.

## Validation

- Required result files exist.
- Durable platform docs exist.
- `result-manifest.json` parsed successfully.
- Focused password/user-profile source tests passed.
- Pumpkin API Release build passed with 0 warnings and 0 errors.
- `git diff --check` passed on V2.8.60WA files.
- Trailing whitespace scan passed on V2.8.60WA files.
- Secret-designated exact-value scan passed with 0 hits.
- Disallowed command-shaped scan passed with 0 hits.
- Protected-path guard passed.
- No files are staged.

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60WA_SUPERADMIN_PASSWORD_ROTATION_RETRY_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-60wa-superadmin-password-rotation-retry-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60WA.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60WA.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60WA.md`

## Next Approval

The next phase is documented in:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60wa-superadmin-password-rotation-retry-result/next-phase-prompt.md`

The clean retry path is to approve V2.8.60WB with a policy-compliant new password in a secure handoff. The source route is already deployed and live.

## Exact-Path Commit Instructions

Do not use `git add -A`.

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60WA_SUPERADMIN_PASSWORD_ROTATION_RETRY_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-60wa-superadmin-password-rotation-retry-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60WA.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60WA.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60WA.md"

git diff --cached --check
git commit -m "Add V2.8.60WA SuperAdmin password rotation retry closeout"
```
