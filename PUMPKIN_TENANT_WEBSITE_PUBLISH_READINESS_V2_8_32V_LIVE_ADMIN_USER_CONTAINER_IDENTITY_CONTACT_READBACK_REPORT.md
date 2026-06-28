# Pumpkin Tenant Website Publish Readiness V2.8.32V Live Admin User Container Identity Contact Readback Report

Date: 2026-06-28 UTC

Phase status: blocked after Admin identity repair, before Admin readback and production contact POST.

Classification: `admin_login_failed_http_500_after_identity_repair`.

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32v-live-admin-user-container-identity-contact-readback-result/`

## Summary

V2.8.32V resolved the V2.8.32U blocker. The source-required `User` container now exists with partition key `/tenantId`, and the approved Admin identity record exists for the approved tenant/email. The final sanitized helper confirmation shows the identity is tenant-matched, active, TenantAdmin, and password-compatible.

The post-repair live Admin login moved past the previous HTTP 401 state but returned HTTP 500. No bearer token was issued, so Admin FormEntry readback could not run and the production contact POST was not sent.

The likely next source-backed blocker is JWT support config: `Program.cs` requires `Jwt:ExpirationMinutes`, `Jwt:Issuer`, and `Jwt:Audience` during token generation, and V2.8.32T already showed the corresponding appsettings were absent. V2.8.32V was not an appsetting phase, so it stopped.

## Result

- `User` container: exists.
- `User` partition key: `/tenantId`.
- Admin identity: repaired/confirmed.
- Desired password verifies: yes.
- Live Admin login: HTTP 500.
- Bearer token issued: no.
- Admin readback preflight: not run.
- Static contact preflights: not run.
- Production contact POST count: 0.
- Contact gate: open.

## Security Boundary

- No deploy or redeploy occurred.
- No Azure App Service appsetting mutation occurred.
- No appsettings list/show occurred.
- No protected config file was read except `.tmp/v2-8-32v/secure/live-admin-user-container-identity-repair.json`.
- No `.env.local`, appsettings file, or local settings file was read.
- No Key Vault secret query, keys/listKeys, connection string generation, or SAS generation occurred.
- No DNS/custom-domain or indexing action occurred.
- No inbox/provider login occurred.
- No production contact POST was sent.
- No secret value was printed or written into the result package.

## Validation

- `result-manifest.json` parsed successfully.
- Ignored helper build succeeded with 0 warnings and 0 errors.
- `git diff --check` passed for the V root report and result package.
- Trailing whitespace scan passed for the V root report, result package, and ignored helper source files.
- Required result files: 22/22 present, 0 missing, 0 extra.
- Secret scan passed for approved secure-file protected values, BCrypt hash patterns, and bearer JWT patterns.
- Staged file count: 0.

## Commit Instructions

Stage only these paths:

```powershell
git add "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32V_LIVE_ADMIN_USER_CONTAINER_IDENTITY_CONTACT_READBACK_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32v-live-admin-user-container-identity-contact-readback-result/"
git commit -m "docs: add v2.8.32v admin user container identity result"
```

Do not stage `.tmp/`.
